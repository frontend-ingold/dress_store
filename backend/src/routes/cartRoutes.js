import { Router } from "express";
import {
  addCartItem,
  checkoutCart,
  getCart,
  removeCartItem,
  updateCartItem
} from "../controllers/cartController.js";

const router = Router();

router.get("/:cartToken", getCart);
router.post("/items", addCartItem);
router.put("/items", updateCartItem);
router.delete("/items/:productId", removeCartItem);
router.post("/checkout", checkoutCart);

export default router;
