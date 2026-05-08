import { Router } from "express";
import {
  addFavorite,
  getFavorites,
  removeFavorite
} from "../controllers/favoriteController.js";

const router = Router();

router.get("/:userId", getFavorites);
router.post("/", addFavorite);
router.delete("/:userId/:productId", removeFavorite);

export default router;
