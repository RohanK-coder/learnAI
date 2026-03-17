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
      SELECT 
        conv.id,
        conv.course_id,
        c.title AS course_title,
        u.name AS professor_name
      FROM conversations conv
      JOIN courses c ON c.id = conv.course_id
      LEFT JOIN users u ON u.id = conv.professor_id
      WHERE conv.student_id = ?
      ORDER BY conv.created_at DESC
      `,
      [user.id]
    );

    return res.json(rows);
  }

  if (user.role === "professor") {
    const [rows] = await db.query(
      `
      SELECT 
        conv.id,
        conv.course_id,
        c.title AS course_title,
        s.name AS student_name
      FROM conversations conv
      JOIN courses c ON c.id = conv.course_id
      JOIN users s ON s.id = conv.student_id
      WHERE conv.professor_id = ?
      ORDER BY conv.created_at DESC
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

  if (!courseId) {
    return res.status(400).json({ message: "courseId is required" });
  }

  if (user.role !== "student") {
    return res
      .status(403)
      .json({ message: "Only students can create conversations" });
  }

  const numericCourseId = Number(courseId);

  const [courseRows] = await db.query(
    `
    SELECT c.id, c.professor_id, c.title
    FROM courses c
    WHERE c.id = ?
    `,
    [numericCourseId]
  );

  const course = (courseRows as any[])[0];

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  if (!course.professor_id) {
    return res
      .status(400)
      .json({ message: "This course has no assigned professor yet" });
  }

  const [enrollmentRows] = await db.query(
    `
    SELECT id
    FROM enrollments
    WHERE user_id = ? AND course_id = ?
    `,
    [user.id, numericCourseId]
  );

  if ((enrollmentRows as any[]).length === 0) {
    return res.status(403).json({
      message: "You must be enrolled in this course before starting a conversation",
    });
  }

  const [existingRows] = await db.query(
    `
    SELECT id, professor_id
    FROM conversations
    WHERE student_id = ? AND course_id = ?
    `,
    [user.id, numericCourseId]
  );

  const existing = existingRows as any[];

  if (existing.length > 0) {
    const conversationId = existing[0].id;

    if (existing[0].professor_id !== course.professor_id) {
      await db.query(
        `
        UPDATE conversations
        SET professor_id = ?
        WHERE id = ?
        `,
        [course.professor_id, conversationId]
      );
    }

    return res.json({ conversationId });
  }

  const [result] = await db.query(
    `
    INSERT INTO conversations (student_id, professor_id, course_id)
    VALUES (?, ?, ?)
    `,
    [user.id, course.professor_id, numericCourseId]
  );

  return res.status(201).json({
    message: "Conversation created",
    conversationId: (result as any).insertId,
  });
}

export async function getMessages(req: AuthRequest, res: Response) {
  const user = req.user!;
  const conversationId = Number(req.params.conversationId);

  const [convRows] = await db.query(
    `
    SELECT *
    FROM conversations
    WHERE id = ?
    `,
    [conversationId]
  );

  const conversation = (convRows as any[])[0];

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  if (user.role === "student" && conversation.student_id !== user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (user.role === "professor" && conversation.professor_id !== user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  let query = `
    SELECT 
      id,
      conversation_id,
      sender_type,
      sender_id,
      content,
      shared_with_professor,
      created_at
    FROM messages
    WHERE conversation_id = ?
  `;

  if (user.role === "professor") {
    query += `
      AND (
        sender_type = 'student'
        OR sender_type = 'professor'
        OR (sender_type = 'ai' AND shared_with_professor = true)
      )
    `;
  }

  query += ` ORDER BY created_at ASC, id ASC`;

  const [rows] = await db.query(query, [conversationId]);

  return res.json(rows);
}

export async function sendStudentMessage(req: AuthRequest, res: Response) {
  const user = req.user!;
  const conversationId = Number(req.params.conversationId);
  const { content } = req.body;

  if (user.role !== "student") {
    return res
      .status(403)
      .json({ message: "Only students can send student messages" });
  }

  if (!content || !String(content).trim()) {
    return res.status(400).json({ message: "Message content is required" });
  }

  const [convRows] = await db.query(
    `
    SELECT conv.*, c.title AS course_title, p.name AS professor_name
    FROM conversations conv
    JOIN courses c ON c.id = conv.course_id
    LEFT JOIN users p ON p.id = conv.professor_id
    WHERE conv.id = ? AND conv.student_id = ?
    `,
    [conversationId, user.id]
  );

  const conversation = (convRows as any[])[0];

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const [studentInsert] = await db.query(
    `
    INSERT INTO messages (
      conversation_id,
      sender_type,
      sender_id,
      content,
      shared_with_professor
    )
    VALUES (?, 'student', ?, ?, false)
    `,
    [conversationId, user.id, String(content).trim()]
  );

  let aiReply = "I could not generate a response right now.";

  try {
    aiReply = await getGeminiReply({
      courseTitle: conversation.course_title,
      professorName: conversation.professor_name,
      question: String(content).trim(),
    });
  } catch (error) {
    console.error("Gemini error:", error);
  }

  const [aiInsert] = await db.query(
    `
    INSERT INTO messages (
      conversation_id,
      sender_type,
      sender_id,
      content,
      shared_with_professor
    )
    VALUES (?, 'ai', NULL, ?, false)
    `,
    [conversationId, aiReply]
  );

  const [newRows] = await db.query(
    `
    SELECT 
      id,
      conversation_id,
      sender_type,
      sender_id,
      content,
      shared_with_professor,
      created_at
    FROM messages
    WHERE id IN (?, ?)
    ORDER BY created_at ASC, id ASC
    `,
    [(studentInsert as any).insertId, (aiInsert as any).insertId]
  );

  getIo().to(`conversation:${conversationId}`).emit("message:new");

  return res.json({
    ok: true,
    messages: newRows,
  });
}

export async function sendProfessorMessage(req: AuthRequest, res: Response) {
  const user = req.user!;
  const conversationId = Number(req.params.conversationId);
  const { content } = req.body;

  if (user.role !== "professor") {
    return res
      .status(403)
      .json({ message: "Only professors can send professor messages" });
  }

  if (!content || !String(content).trim()) {
    return res.status(400).json({ message: "Message content is required" });
  }

  const [convRows] = await db.query(
    `
    SELECT *
    FROM conversations
    WHERE id = ? AND professor_id = ?
    `,
    [conversationId, user.id]
  );

  const conversation = (convRows as any[])[0];

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  await db.query(
    `
    INSERT INTO messages (
      conversation_id,
      sender_type,
      sender_id,
      content,
      shared_with_professor
    )
    VALUES (?, 'professor', ?, ?, true)
    `,
    [conversationId, user.id, String(content).trim()]
  );

  getIo().to(`conversation:${conversationId}`).emit("message:new");

  return res.json({ ok: true });
}

export async function shareAiMessage(req: AuthRequest, res: Response) {
  const user = req.user!;
  const conversationId = Number(req.params.conversationId);
  const messageId = Number(req.params.messageId);

  if (user.role !== "student") {
    return res
      .status(403)
      .json({ message: "Only students can share AI messages" });
  }

  const [convRows] = await db.query(
    `
    SELECT *
    FROM conversations
    WHERE id = ? AND student_id = ?
    `,
    [conversationId, user.id]
  );

  const conversation = (convRows as any[])[0];

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const [messageRows] = await db.query(
    `
    SELECT id, sender_type
    FROM messages
    WHERE id = ? AND conversation_id = ?
    `,
    [messageId, conversationId]
  );

  const message = (messageRows as any[])[0];

  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  if (message.sender_type !== "ai") {
    return res.status(400).json({ message: "Only AI messages can be shared" });
  }

  await db.query(
    `
    UPDATE messages
    SET shared_with_professor = true
    WHERE id = ? AND conversation_id = ?
    `,
    [messageId, conversationId]
  );

  getIo().to(`conversation:${conversationId}`).emit("message:shared");

  return res.json({ ok: true, message: "AI message shared with professor" });
}