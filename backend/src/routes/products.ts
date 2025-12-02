import { Router } from "express";
import { listProducts, createProduct } from "../controllers/productController";
import { authenticateToken, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/", listProducts);
router.post("/", authenticateToken, requireAdmin, createProduct);

export default router;
