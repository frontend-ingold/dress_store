import { query } from "../config/db.js";

export async function getProducts(_request, response, next) {
  try {
    const products = await query(
      `SELECT id, name, description, category, price, image_url AS "imageUrl", stock
       FROM products
       WHERE is_active = TRUE
       ORDER BY created_at DESC`
    );

    response.json({ products });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(_request, response, next) {
  try {
    const categories = await query(
      `SELECT DISTINCT category
       FROM products
       WHERE is_active = TRUE
       ORDER BY category ASC`
    );

    response.json({ categories: categories.map((item) => item.category) });
  } catch (error) {
    next(error);
  }
}
