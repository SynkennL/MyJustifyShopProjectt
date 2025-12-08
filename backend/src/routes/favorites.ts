import { Router } from "express";
import { 
  addToFavorites, 
  removeFromFavorites, 
  getFavorites, 
  checkIsFavorite,
  getFavoriteIds 
} from "../controllers/favoriteController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.post("/", authenticateToken, addToFavorites);
router.delete("/:product_id", authenticateToken, removeFromFavorites);
router.get("/", authenticateToken, getFavorites);
router.get("/check/:product_id", authenticateToken, checkIsFavorite);
router.get("/ids", authenticateToken, getFavoriteIds);

export default router;