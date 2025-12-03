"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategories = listCategories;
exports.createCategory = createCategory;
const db_1 = require("../db");
async function listCategories(req, res) {
    const q = await db_1.pool.query("SELECT id, name, slug FROM categories ORDER BY id");
    res.json(q.rows);
}
async function createCategory(req, res) {
    const { name, slug } = req.body;
    if (!name || !slug)
        return res.status(400).json({ error: "name & slug required" });
    const q = await db_1.pool.query("INSERT INTO categories (name, slug) VALUES ($1,$2) RETURNING id, name, slug", [name, slug]);
    res.status(201).json(q.rows[0]);
}
