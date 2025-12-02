import { Request, Response } from "express";
import { pool } from "../db";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ?? "secret";
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN ?? "7d";

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const client = await pool.connect();
  try {
    const hashed = await bcrypt.hash(password, 10);
    const q = await client.query(
      "INSERT INTO users (email, password_hash, name) VALUES ($1,$2,$3) RETURNING id, email, name, role",
      [email, hashed, name || null]
    );
    const user = q.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES_IN } as jwt.SignOptions
    );

    res.json({ token, user });
  } catch (err: any) {
    if (err.code === "23505") return res.status(400).json({ error: "Email already used" });
    throw err;
  } finally {
    client.release();
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const client = await pool.connect();
  try {
    const q = await client.query("SELECT id, email, password_hash, name, role FROM users WHERE email=$1", [email]);
    if (q.rows.length === 0) return res.status(400).json({ error: "Invalid credentials" });
    const u = q.rows[0];

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: u.id, email: u.email, role: u.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES_IN } as jwt.SignOptions
    );

    res.json({ token, user: u });
  } finally {
    client.release();
  }
}
