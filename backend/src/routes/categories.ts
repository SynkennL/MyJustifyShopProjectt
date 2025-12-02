import { Router } from "express";
import { listCategories, createCategory } from "../controllers/categoryController";
import { authenticateToken, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/", listCategories);
router.post("/", authenticateToken, requireAdmin, createCategory);

export default router;
