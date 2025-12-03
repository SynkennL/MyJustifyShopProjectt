"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get("/", productController_1.listProducts);
router.post("/", auth_1.authenticateToken, auth_1.requireAdmin, productController_1.createProduct);
exports.default = router;
