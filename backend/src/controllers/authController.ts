import { Request, Response } from "express";
import { pool } from "../db";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ?? "secret";
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN ?? "7d";

export async function register(req: Request, res: Response) {
  const { email, password, name, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  if (!role || !['admin', 'customer'].includes(role)) {
    return res.status(400).json({ error: "Valid role required (admin or customer)" });
  }

  const client = await pool.connect();
  try {
    const hashed = await bcrypt.hash(password, 10);
    const q = await client.query(
      "INSERT INTO users (email, password_hash, name, role) VALUES ($1,$2,$3,$4) RETURNING id, email, name, role",
      [email, hashed, name || null, role]
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

export async function updateProfile(req: Request, res: Response) {
  const { name, email, currentPassword, newPassword } = req.body;
  const userId = (req as any).user?.id;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const client = await pool.connect();
  try {
    // Mevcut kullanıcıyı getir
    const userQuery = await client.query(
      "SELECT id, email, password_hash, name, role FROM users WHERE id=$1",
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentUser = userQuery.rows[0];

    if (email !== currentUser.email) {
      const emailCheck = await client.query(
        "SELECT id FROM users WHERE email=$1 AND id!=$2",
        [email, userId]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    let newPasswordHash = currentUser.password_hash;
    
    if (currentPassword || newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Mevcut şifrenizi girmelisiniz" });
      }
      
      if (!newPassword) {
        return res.status(400).json({ error: "Yeni şifrenizi girmelisiniz" });
      }

      const passwordMatch = await bcrypt.compare(currentPassword, currentUser.password_hash);
      if (!passwordMatch) {
        return res.status(400).json({ error: "Mevcut şifre yanlış!" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Yeni şifre en az 6 karakter olmalıdır" });
      }

      newPasswordHash = await bcrypt.hash(newPassword, 10);
    }

    const updateQuery = await client.query(
      "UPDATE users SET name=$1, email=$2, password_hash=$3 WHERE id=$4 RETURNING id, email, name, role",
      [name, email, newPasswordHash, userId]
    );

    const updatedUser = updateQuery.rows[0];

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (err: any) {
    console.error("Profile update error:", err);
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already in use" });
    }
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
}