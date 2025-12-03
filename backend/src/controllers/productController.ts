import { Request, Response } from "express";
import { pool } from "../db";

export async function listProducts(req: Request, res: Response) {
  try {
    const { category } = req.query;
    let q;

    if (category) {
      q = await pool.query(
        `SELECT p.*, c.name as category_name, c.slug as category_slug, u.email as seller_email, u.name as seller_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN users u ON p.seller_id = u.id
         WHERE c.slug = $1
         ORDER BY p.id`,
        [category]
      );
    } else {
      q = await pool.query(
        `SELECT p.*, c.name as category_name, c.slug as category_slug, u.email as seller_email, u.name as seller_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN users u ON p.seller_id = u.id
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
  const seller_id = (req as any).user?.id;

  if (!title || price == null) return res.status(400).json({ error: "title & price required" });
  if (!seller_id) return res.status(401).json({ error: "Unauthorized" });

  const q = await pool.query(
    "INSERT INTO products (title, description, price, category_id, image_url, seller_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
    [title, description || null, price, category_id || null, image_url || null, seller_id]
  );

  res.status(201).json(q.rows[0]);
}

export async function deleteProduct(req: Request, res: Response) {
  const { id } = req.params;
  const user_id = (req as any).user?.id;
  const user_role = (req as any).user?.role;

  try {
    let query;
    if (user_role === 'admin') {
      // Admin tüm ürünleri silebilir
      query = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
    } else {
      // Normal kullanıcı sadece kendi ürünlerini silebilir
      query = await pool.query("DELETE FROM products WHERE id = $1 AND seller_id = $2 RETURNING *", [id, user_id]);
    }

    if (query.rows.length === 0) {
      return res.status(404).json({ error: "Product not found or unauthorized" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}