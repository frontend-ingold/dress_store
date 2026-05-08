import { query, withTransaction } from "../config/db.js";

function parseUserId(value) {
  const userId = Number(value);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

function parseProductId(value) {
  const productId = Number(value);
  return Number.isInteger(productId) && productId > 0 ? productId : null;
}

export async function getFavorites(request, response, next) {
  const userId = parseUserId(request.params.userId);

  if (!userId) {
    response.status(400).json({ message: "A valid user id is required." });
    return;
  }

  try {
    const favorites = await query(
      `SELECT product_id AS "productId"
       FROM favorites
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    response.json({
      favorites: favorites.map((item) => String(item.productId))
    });
  } catch (error) {
    next(error);
  }
}

export async function addFavorite(request, response, next) {
  const userId = parseUserId(request.body.userId);
  const productId = parseProductId(request.body.productId);

  if (!userId || !productId) {
    response.status(400).json({ message: "Valid user and product ids are required." });
    return;
  }

  try {
    await withTransaction(async (client) => {
      const userResult = await client.query(
        `SELECT id
         FROM users
         WHERE id = $1
           AND is_active = TRUE
         LIMIT 1`,
        [userId]
      );

      if (!userResult.rows[0]) {
        throw new Error("User not found.");
      }

      const productResult = await client.query(
        `SELECT id
         FROM products
         WHERE id = $1
           AND is_active = TRUE
         LIMIT 1`,
        [productId]
      );

      if (!productResult.rows[0]) {
        throw new Error("Product not found.");
      }

      await client.query(
        `INSERT INTO favorites (user_id, product_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, product_id) DO NOTHING`,
        [userId, productId]
      );
    });

    const favorites = await query(
      `SELECT product_id AS "productId"
       FROM favorites
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    response.status(201).json({
      message: "Favorite added.",
      favorites: favorites.map((item) => String(item.productId))
    });
  } catch (error) {
    if (error.message) {
      response.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function removeFavorite(request, response, next) {
  const userId = parseUserId(request.params.userId);
  const productId = parseProductId(request.params.productId);

  if (!userId || !productId) {
    response.status(400).json({ message: "Valid user and product ids are required." });
    return;
  }

  try {
    await query(
      `DELETE FROM favorites
       WHERE user_id = $1
         AND product_id = $2`,
      [userId, productId]
    );

    const favorites = await query(
      `SELECT product_id AS "productId"
       FROM favorites
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    response.json({
      message: "Favorite removed.",
      favorites: favorites.map((item) => String(item.productId))
    });
  } catch (error) {
    next(error);
  }
}
