"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const db_1 = require("../db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET ?? "secret";
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN ?? "7d";
async function register(req, res) {
    const { email, password, name } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "Email and password required" });
    const client = await db_1.pool.connect();
    try {
        const hashed = await bcrypt_1.default.hash(password, 10);
        const q = await client.query("INSERT INTO users (email, password_hash, name) VALUES ($1,$2,$3) RETURNING id, email, name, role", [email, hashed, name || null]);
        const user = q.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
        res.json({ token, user });
    }
    catch (err) {
        if (err.code === "23505")
            return res.status(400).json({ error: "Email already used" });
        throw err;
    }
    finally {
        client.release();
    }
}
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "Email and password required" });
    const client = await db_1.pool.connect();
    try {
        const q = await client.query("SELECT id, email, password_hash, name, role FROM users WHERE email=$1", [email]);
        if (q.rows.length === 0)
            return res.status(400).json({ error: "Invalid credentials" });
        const u = q.rows[0];
        const ok = await bcrypt_1.default.compare(password, u.password_hash);
        if (!ok)
            return res.status(400).json({ error: "Invalid credentials" });
        const token = jwt.sign({ id: u.id, email: u.email, role: u.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
        res.json({ token, user: u });
    }
    finally {
        client.release();
    }
}
