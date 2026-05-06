import { Router } from "express";
import { getCategories, getProducts } from "../controllers/productController.js";

const router = Router();

router.get("/products", getProducts);
router.get("/categories", getCategories);

export default router;
