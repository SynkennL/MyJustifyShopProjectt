import { Request, Response } from "express";
import { pool } from "../db";

export async function addToFavorites(req: Request, res: Response) {
  const { product_id } = req.body;
  const user_id = (req as any).user?.id;

  if (!product_id) return res.status(400).json({ error: "product_id gerekli" });
  if (!user_id) return res.status(401).json({ error: "Unauthorized" });

  try {
    const productCheck = await pool.query("SELECT id FROM products WHERE id = $1", [product_id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: "Ürün bulunamadı" });
    }

    const existingFav = await pool.query(
      "SELECT id FROM favorites WHERE user_id = $1 AND product_id = $2",
      [user_id, product_id]
    );

    if (existingFav.rows.length > 0) {
      return res.status(400).json({ error: "Ürün zaten favorilerde" });
    }

    const result = await pool.query(
      "INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) RETURNING *",
      [user_id, product_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}

export async function removeFromFavorites(req: Request, res: Response) {
  const { product_id } = req.params;
  const user_id = (req as any).user?.id;

  if (!user_id) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await pool.query(
      "DELETE FROM favorites WHERE user_id = $1 AND product_id = $2 RETURNING *",
      [user_id, product_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Favori bulunamadı" });
    }

    res.json({ message: "Favorilerden kaldırıldı" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}

export async function getFavorites(req: Request, res: Response) {
  const user_id = (req as any).user?.id;

  if (!user_id) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await pool.query(
      `SELECT 
        f.id as favorite_id,
        f.created_at as favorited_at,
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        u.email as seller_email,
        u.name as seller_name
       FROM favorites f
       JOIN products p ON f.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.seller_id = u.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}

export async function checkIsFavorite(req: Request, res: Response) {
  const { product_id } = req.params;
  const user_id = (req as any).user?.id;

  if (!user_id) return res.json({ isFavorite: false });

  try {
    const result = await pool.query(
      "SELECT id FROM favorites WHERE user_id = $1 AND product_id = $2",
      [user_id, product_id]
    );

    res.json({ isFavorite: result.rows.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}

export async function getFavoriteIds(req: Request, res: Response) {
  const user_id = (req as any).user?.id;

  if (!user_id) return res.json({ favoriteIds: [] });

  try {
    const result = await pool.query(
      "SELECT product_id FROM favorites WHERE user_id = $1",
      [user_id]
    );

    const favoriteIds = result.rows.map(row => row.product_id);
    res.json({ favoriteIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}