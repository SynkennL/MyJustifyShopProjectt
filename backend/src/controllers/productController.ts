import { Request, Response } from "express";
import { pool } from "../db";


export async function listProducts(req: Request, res: Response) {
  try {
    const { category } = req.query; // frontend'den gelen category slug
    let q;

    if (category) {
      // Belirli kategoriye ait ürünler
      q = await pool.query(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE c.slug = $1
         ORDER BY p.id`,
        [category]
      );
    } else {
      // Tüm ürünler
      q = await pool.query(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         ORDER BY p.id`
      );
    }

    res.json(q.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}

export async function createProduct(req: Request, res: Response) {
  const { title, description, price, category_id, image_url } = req.body;

  if (!title || price == null) return res.status(400).json({ error: "title & price required" });

  const q = await pool.query(
    "INSERT INTO products (title, description, price, category_id, image_url) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [title, description || null, price, category_id || null, image_url || null]
  );

  res.status(201).json(q.rows[0]);
}
