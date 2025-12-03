"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get("/", categoryController_1.listCategories);
router.post("/", auth_1.authenticateToken, auth_1.requireAdmin, categoryController_1.createCategory);
exports.default = router;
