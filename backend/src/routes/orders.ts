import { Router } from "express";
import { createOrder, getMyOrders, updateOrderStatus } from "../controllers/orderController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.post("/", authenticateToken, createOrder);
router.get("/my-orders", authenticateToken, getMyOrders);
router.patch("/:id/status", authenticateToken, updateOrderStatus);

export default router;