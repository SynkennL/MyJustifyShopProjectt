import { Request, Response } from "express";
import { pool } from "../db";

export async function listCategories(req: Request, res: Response) {
  const q = await pool.query("SELECT id, name, slug FROM categories ORDER BY id");
  res.json(q.rows);
}

export async function createCategory(req: Request, res: Response) {
  const { name, slug } = req.body;
  if (!name || !slug) return res.status(400).json({ error: "name & slug required" });
  const q = await pool.query("INSERT INTO categories (name, slug) VALUES ($1,$2) RETURNING id, name, slug", [name, slug]);
  res.status(201).json(q.rows[0]);
}
