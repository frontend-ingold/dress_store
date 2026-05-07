import { query } from "../config/db.js";

export async function getProducts(_request, response, next) {
  try {
    const products = await query(
      `SELECT
         id,
         slug,
         name,
         description,
         category,
         price,
         special_price AS "specialPrice",
         image_url AS "imageUrl",
         stock
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
      `SELECT
         c.id,
         c.name AS category,
         c.slug,
         c.image_url AS "imageUrl",
         c.description,
         COUNT(p.id) AS "productCount"
       FROM categories c
       LEFT JOIN products p
         ON (p.category_id = c.id OR p.category = c.name)
        AND p.is_active = TRUE
       GROUP BY c.id, c.name, c.slug, c.image_url, c.description
       ORDER BY c.name ASC`
    );

    response.json({ categories });
  } catch (error) {
    next(error);
  }
}
