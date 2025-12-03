import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import catRoutes from "./routes/categories";
import prodRoutes from "./routes/products";
import orderRoutes from "./routes/orders";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/categories", catRoutes);
app.use("/api/products", prodRoutes);
app.use("/api/orders", orderRoutes);

app.use(errorHandler);

export default app;
