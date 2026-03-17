import type { Response } from "express";
import { db } from "../config/db";
import type { AuthRequest } from "../middleware/auth";
import { getGeminiReply } from "../services/gemini.service";
import { getIo } from "../socket";

export async function getConversations(req: AuthRequest, res: Response) {
  const user = req.user!;

  if (user.role === "student") {
    const [rows] = await db.query(
      `
      SELECT c.id, c.course_id, cr.title AS course_title, u.name AS professor_name
      FROM conversations c
      JOIN courses cr ON cr.id = c.course_id
      LEFT JOIN users u ON u.id = c.professor_id
      WHERE c.student_id = ?
      ORDER BY c.id DESC
      `,
      [user.id]
    );
    return res.json(rows);
  }

  if (user.role === "professor") {
    const [rows] = await db.query(
      `
      SELECT c.id, c.course_id, cr.title AS course_title, u.name AS student_name
      FROM conversations c
      JOIN courses cr ON cr.id = c.course_id
      JOIN users u ON u.id = c.student_id
      WHERE c.professor_id = ?
      ORDER BY c.id DESC
      `,
      [user.id]
    );
    return res.json(rows);
  }

  return res.json([]);
}

export async function createOrGetConversation(req: AuthRequest, res: Response) {
  const user = req.user!;
  const { courseId } = req.body;

  if (user.role !== "student") {
    return res.status(403).json({ message: "Only students can start conversations" });
  }

  const [courseRows] = await db.query(
    "SELECT id, professor_id FROM courses WHERE id = ?",
    [courseId]
  );

  const course = (courseRows as any[])[0];
  if (!course) return res.status(404).json({ message: "Course not found" });

  const [existing] = await db.query(
    "SELECT id FROM conversations WHERE student_id = ? AND course_id = ?",
    [user.id, courseId]
  );

  if ((existing as any[]).length > 0) {
    return res.json({ conversationId: (existing as any[])[0].id });
  }

  const [result] = await db.query(
    `
    INSERT INTO conversations (student_id, professor_id, course_id)
    VALUES (?, ?, ?)
    `,
    [user.id, course.professor_id, courseId]
  );

  res.json({ conversationId: (result as any).insertId });
}

export async function getMessages(req: AuthRequest, res: Response) {
  const conversationId = Number(req.params.conversationId);

  const [rows] = await db.query(
    `
    SELECT id, conversation_id, sender_type, sender_id, content, shared_with_professor, created_at
    FROM messages
    WHERE conversation_id = ?
    ORDER BY created_at ASC
    `,
    [conversationId]
  );

  res.json(rows);
}

export async function sendStudentMessage(req: AuthRequest, res: Response) {
  const user = req.user!;
  const conversationId = Number(req.params.conversationId);
  const { content } = req.body;

  if (user.role !== "student") {
    return res.status(403).json({ message: "Only students can send student messages here" });
  }

  await db.query(
    `
    INSERT INTO messages (conversation_id, sender_type, sender_id, content, shared_with_professor)
    VALUES (?, 'student', ?, ?, false)
    `,
    [conversationId, user.id, content]
  );

  const [metaRows] = await db.query(
    `
    SELECT c.id, cr.title AS course_title, u.name AS professor_name
    FROM conversations c
    JOIN courses cr ON cr.id = c.course_id
    LEFT JOIN users u ON u.id = c.professor_id
    WHERE c.id = ?
    `,
    [conversationId]
  );

  const meta = (metaRows as any[])[0];
  const aiText = await getGeminiReply({
    courseTitle: meta.course_title,
    professorName: meta.professor_name,
    question: content,
  });

  const [aiInsert] = await db.query(
    `
    INSERT INTO messages (conversation_id, sender_type, sender_id, content, shared_with_professor)
    VALUES (?, 'ai', NULL, ?, false)
    `,
    [conversationId, aiText]
  );

  const [rows] = await db.query(
    `
    SELECT id, conversation_id, sender_type, sender_id, content, shared_with_professor, created_at
    FROM messages
    WHERE id IN (?, LAST_INSERT_ID())
    ORDER BY created_at ASC
    `,
    [(aiInsert as any).insertId - 1]
  );

  getIo().to(`conversation:${conversationId}`).emit("message:new");

  res.json({
    ok: true,
    aiMessageId: (aiInsert as any).insertId,
    messages: rows,
  });
}

export async function sendProfessorMessage(req: AuthRequest, res: Response) {
  const user = req.user!;
  const conversationId = Number(req.params.conversationId);
  const { content } = req.body;

  if (user.role !== "professor") {
    return res.status(403).json({ message: "Only professors can send professor messages" });
  }

  await db.query(
    `
    INSERT INTO messages (conversation_id, sender_type, sender_id, content, shared_with_professor)
    VALUES (?, 'professor', ?, ?, true)
    `,
    [conversationId, user.id, content]
  );

  getIo().to(`conversation:${conversationId}`).emit("message:new");

  res.json({ ok: true });
}

export async function shareAiMessage(req: AuthRequest, res: Response) {
  const user = req.user!;
  const messageId = Number(req.params.messageId);
  const conversationId = Number(req.params.conversationId);

  if (user.role !== "student") {
    return res.status(403).json({ message: "Only students can share AI messages" });
  }

  await db.query(
    `
    UPDATE messages
    SET shared_with_professor = true
    WHERE id = ? AND conversation_id = ? AND sender_type = 'ai'
    `,
    [messageId, conversationId]
  );

  getIo().to(`conversation:${conversationId}`).emit("message:shared", { messageId });

  res.json({ ok: true });
}