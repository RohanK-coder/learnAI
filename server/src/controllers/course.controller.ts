import type { Request, Response } from "express";
import { db } from "../config/db";
import type { AuthRequest } from "../middleware/auth";
import { getIo } from "../socket";

export async function getCourses(_req: Request, res: Response) {
  const [rows] = await db.query(`
    SELECT 
      c.id,
      c.title,
      c.description,
      c.difficulty,
      c.professor_id,
      u.name AS professor_name,
      COUNT(s.id) AS slide_count
    FROM courses c
    LEFT JOIN users u ON u.id = c.professor_id
    LEFT JOIN slides s ON s.course_id = c.id
    GROUP BY c.id
    ORDER BY c.id ASC
  `);

  res.json(rows);
}

export async function getMyCourses(req: AuthRequest, res: Response) {
  const userId = req.user!.id;

  const [rows] = await db.query(
    `
    SELECT 
      c.id,
      c.title,
      c.description,
      c.difficulty,
      c.professor_id,
      u.name AS professor_name,
      e.enrolled_at,
      COALESCE(cx.xp, 0) AS xp
    FROM enrollments e
    JOIN courses c ON c.id = e.course_id
    LEFT JOIN users u ON u.id = c.professor_id
    LEFT JOIN course_xp cx ON cx.user_id = e.user_id AND cx.course_id = e.course_id
    WHERE e.user_id = ?
    ORDER BY e.enrolled_at DESC
    `,
    [userId]
  );

  res.json(rows);
}

export async function createCourse(req: AuthRequest, res: Response) {
  const { title, description, difficulty } = req.body;

  if (!title || !description || !difficulty) {
    return res.status(400).json({ message: "title, description and difficulty are required" });
  }

  const professorId = req.user!.role === "professor" ? req.user!.id : null;

  const [result] = await db.query(
    `
    INSERT INTO courses (title, description, difficulty, professor_id)
    VALUES (?, ?, ?, ?)
    `,
    [title, description, difficulty, professorId]
  );

  const courseId = (result as any).insertId;

  for (let i = 1; i <= 10; i++) {
    await db.query(
      `
      INSERT INTO slides (course_id, slide_number, title, content)
      VALUES (?, ?, ?, ?)
      `,
      [
        courseId,
        i,
        `${title} - Slide ${i}`,
        `This is slide ${i} for ${title}. Add your learning content here.`,
      ]
    );
  }

  res.status(201).json({
    message: "Course created",
    courseId,
  });
}

export async function enrollInCourse(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const courseId = Number(req.params.courseId);

  const [check] = await db.query(
    `SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?`,
    [userId, courseId]
  );

  if ((check as any[]).length === 0) {
    await db.query(
      `INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)`,
      [userId, courseId]
    );

    await db.query(
      `
      INSERT INTO course_xp (user_id, course_id, xp)
      VALUES (?, ?, 0)
      ON DUPLICATE KEY UPDATE xp = xp
      `,
      [userId, courseId]
    );
  }

  const [leaderboard] = await db.query(
    `
    SELECT u.id, u.name, cx.xp
    FROM course_xp cx
    JOIN users u ON u.id = cx.user_id
    WHERE cx.course_id = ?
    ORDER BY cx.xp DESC, u.name ASC
    `,
    [courseId]
  );

  getIo().to(`course:${courseId}`).emit("leaderboard:update", leaderboard);

  res.json({ message: "Enrolled successfully" });
}

export async function getCourseSlides(req: AuthRequest, res: Response) {
  const courseId = Number(req.params.courseId);

  const [rows] = await db.query(
    `
    SELECT id, course_id, slide_number, title, content
    FROM slides
    WHERE course_id = ?
    ORDER BY slide_number ASC
    `,
    [courseId]
  );

  res.json(rows);
}

export async function viewSlide(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const courseId = Number(req.params.courseId);
  const slideId = Number(req.params.slideId);

  const [existing] = await db.query(
    `SELECT id FROM slide_views WHERE user_id = ? AND slide_id = ?`,
    [userId, slideId]
  );

  let gainedXp = 0;

  if ((existing as any[]).length === 0) {
    await db.query(
      `INSERT INTO slide_views (user_id, course_id, slide_id) VALUES (?, ?, ?)`,
      [userId, courseId, slideId]
    );

    await db.query(
      `
      INSERT INTO course_xp (user_id, course_id, xp)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE xp = xp + 1
      `,
      [userId, courseId]
    );

    gainedXp = 1;
  }

  const [leaderboard] = await db.query(
    `
    SELECT u.id, u.name, cx.xp
    FROM course_xp cx
    JOIN users u ON u.id = cx.user_id
    WHERE cx.course_id = ?
    ORDER BY cx.xp DESC, u.name ASC
    `,
    [courseId]
  );

  getIo().to(`course:${courseId}`).emit("leaderboard:update", leaderboard);

  res.json({
    message: "Slide viewed",
    gainedXp,
    leaderboard,
  });
}

export async function getLeaderboard(req: AuthRequest, res: Response) {
  const courseId = Number(req.params.courseId);

  const [rows] = await db.query(
    `
    SELECT u.id, u.name, cx.xp
    FROM course_xp cx
    JOIN users u ON u.id = cx.user_id
    WHERE cx.course_id = ?
    ORDER BY cx.xp DESC, u.name ASC
    `,
    [courseId]
  );

  res.json(rows);
}