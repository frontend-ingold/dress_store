import { Router } from "express";
import { createOrder, getOrdersByUser } from "../controllers/orderController.js";

const router = Router();

router.get("/user/:userId", getOrdersByUser);
router.post("/", createOrder);

export default router;
