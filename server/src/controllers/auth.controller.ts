import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../config/db";
import { signToken } from "../utils/jwt";

export async function register(req: Request, res: Response) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
  if ((existing as any[]).length > 0) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [result] = await db.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [name, email, passwordHash, role]
  );

  const insertId = (result as any).insertId;

  const token = signToken({ id: insertId, email, role });

  res.status(201).json({
    token,
    user: { id: insertId, name, email, role },
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const [rows] = await db.query(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
    [email]
  );

  const users = rows as any[];
  if (users.length === 0) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const user = users[0];
  const ok = await bcrypt.compare(password, user.password_hash);

  if (!ok) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}