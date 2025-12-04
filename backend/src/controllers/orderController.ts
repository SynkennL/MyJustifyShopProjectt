import { Request, Response } from "express";
import { pool } from "../db";

export async function createOrder(req: Request, res: Response) {
  const { product_id, quantity, sizes } = req.body;
  const buyer_id = (req as any).user?.id;

  if (!product_id || !quantity) return res.status(400).json({ error: "product_id & quantity required" });
  if (!buyer_id) return res.status(401).json({ error: "Unauthorized" });

  const client = await pool.connect();
  try {
    const productQuery = await client.query(
      "SELECT id, title, price, seller_id FROM products WHERE id = $1",
      [product_id]
    );
    
    if (productQuery.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = productQuery.rows[0];
    
    // Kendi ürününü satın alamaz kontrolü
    if (product.seller_id === buyer_id) {
      return res.status(400).json({ error: "Kendi ürününüzü satın alamazsınız!" });
    }

    const total_price = product.price * quantity;

    let orderQuery;
    try {
      if (sizes && Array.isArray(sizes) && sizes.length > 0) {
        const sizesJson = JSON.stringify(sizes);
        orderQuery = await client.query(
          `INSERT INTO orders (buyer_id, seller_id, product_id, quantity, total_price, status, sizes) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           RETURNING *`,
          [buyer_id, product.seller_id, product_id, quantity, total_price, 'pending', sizesJson]
        );
      } else {
        orderQuery = await client.query(
          `INSERT INTO orders (buyer_id, seller_id, product_id, quantity, total_price, status) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING *`,
          [buyer_id, product.seller_id, product_id, quantity, total_price, 'pending']
        );
      }
    } catch (insertErr: any) {
      if (insertErr.message && insertErr.message.includes('sizes')) {
        orderQuery = await client.query(
          `INSERT INTO orders (buyer_id, seller_id, product_id, quantity, total_price, status) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING *`,
          [buyer_id, product.seller_id, product_id, quantity, total_price, 'pending']
        );
      } else {
        throw insertErr;
      }
    }

    res.status(201).json(orderQuery.rows[0]);
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
}

export async function getMyOrders(req: Request, res: Response) {
  const user_id = (req as any).user?.id;

  if (!user_id) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Hem satın aldığım hem de sattığım siparişleri getir
    const query = await pool.query(
      `SELECT 
        o.*,
        p.title as product_title, 
        p.image_url,
        seller.email as seller_email,
        buyer.email as buyer_email
       FROM orders o
       LEFT JOIN products p ON o.product_id = p.id
       LEFT JOIN users seller ON o.seller_id = seller.id
       LEFT JOIN users buyer ON o.buyer_id = buyer.id
       WHERE o.buyer_id = $1 OR o.seller_id = $1
       ORDER BY o.created_at DESC`,
      [user_id]
    );

    const parsedRows = query.rows.map((row: any) => {
      if (row.sizes && typeof row.sizes === 'string') {
        try {
          row.sizes = JSON.parse(row.sizes);
        } catch (e) {
          row.sizes = null;
        }
      }
      return row;
    });

    res.json(parsedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;
  const user_id = (req as any).user?.id;

  if (!status) return res.status(400).json({ error: "status required" });

  try {
    const result = await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2 AND seller_id = $3 RETURNING *`,
      [status, id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found or unauthorized" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}