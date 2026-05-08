import { Router } from "express";
import { getCategories, getProductByPathParam, getProducts } from "../controllers/productController.js";

const router = Router();

router.get("/products", getProducts);
router.get("/products/:pathParam", getProductByPathParam);
router.get("/categories", getCategories);

export default router;
