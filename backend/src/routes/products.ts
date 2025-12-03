import { Router } from "express";
import { listProducts, createProduct, deleteProduct } from "../controllers/productController";
import { authenticateToken, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/", listProducts);
router.post("/", authenticateToken, createProduct);
router.delete("/:id", authenticateToken, deleteProduct);

export default router;