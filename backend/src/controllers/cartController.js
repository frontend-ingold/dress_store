import { query, withTransaction } from "../config/db.js";

function validateCartToken(cartToken) {
  return typeof cartToken === "string" && cartToken.trim().length >= 8;
}

function validateCheckout(body) {
  const requiredFields = ["customerName", "email", "phone", "address", "city", "postalCode"];
  const missingField = requiredFields.find((field) => !body[field]?.trim?.());

  if (missingField) {
    return `Missing required field: ${missingField}`;
  }

  if (!validateCartToken(body.cartToken)) {
    return "A valid cart token is required.";
  }

  return null;
}

async function resolveActiveUserId(client, userId) {
  const parsedUserId = Number(userId);

  if (!Number.isInteger(parsedUserId) || parsedUserId < 1) {
    return null;
  }

  const users = await client.query(
    `SELECT id
     FROM users
     WHERE id = $1
       AND is_active = TRUE
     LIMIT 1`,
    [parsedUserId]
  );

  return users.rows[0]?.id || null;
}

async function ensureCart(client, cartToken) {
  const existingCart = await client.query(
    `SELECT id, cart_token AS "cartToken"
     FROM carts
     WHERE cart_token = $1`,
    [cartToken]
  );

  if (existingCart.rows[0]) {
    return existingCart.rows[0];
  }

  const createdCart = await client.query(
    `INSERT INTO carts (cart_token)
     VALUES ($1)
     RETURNING id, cart_token AS "cartToken"`,
    [cartToken]
  );

  return createdCart.rows[0];
}

async function getCartSnapshot(client, cartToken) {
  const cart = await ensureCart(client, cartToken);
  const itemsResult = await client.query(
    `SELECT
       ci.product_id AS "productId",
       ci.quantity,
       p.slug,
       p.name,
       p.category,
       p.price,
       p.special_price AS "specialPrice",
       p.image_url AS "imageUrl",
       p.stock
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = $1
       AND p.is_active = TRUE
     ORDER BY ci.created_at DESC`,
    [cart.id]
  );

  const items = itemsResult.rows.map((item) => {
    const unitPrice = Number(item.specialPrice ?? item.price);
    const quantity = Number(item.quantity);

    return {
      ...item,
      quantity,
      unitPrice,
      lineTotal: Number((unitPrice * quantity).toFixed(2))
    };
  });

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));

  return {
    cartToken: cart.cartToken,
    itemCount,
    subtotal,
    items
  };
}

export async function getCart(request, response, next) {
  const { cartToken } = request.params;

  if (!validateCartToken(cartToken)) {
    response.status(400).json({ message: "A valid cart token is required." });
    return;
  }

  try {
    const cart = await withTransaction((client) => getCartSnapshot(client, cartToken));
    response.json({ cart });
  } catch (error) {
    next(error);
  }
}

export async function addCartItem(request, response, next) {
  const { cartToken, productId, quantity = 1 } = request.body;
  const parsedQuantity = Number(quantity);
  const parsedProductId = Number(productId);

  if (!validateCartToken(cartToken)) {
    response.status(400).json({ message: "A valid cart token is required." });
    return;
  }

  if (!parsedProductId || parsedQuantity < 1) {
    response.status(400).json({ message: "Valid product and quantity are required." });
    return;
  }

  try {
    const cart = await withTransaction(async (client) => {
      const ensuredCart = await ensureCart(client, cartToken);
      const productResult = await client.query(
        `SELECT id, name, stock
         FROM products
         WHERE id = $1 AND is_active = TRUE`,
        [parsedProductId]
      );
      const product = productResult.rows[0];

      if (!product) {
        throw new Error("Selected product no longer exists.");
      }

      const existingItemResult = await client.query(
        `SELECT quantity
         FROM cart_items
         WHERE cart_id = $1 AND product_id = $2`,
        [ensuredCart.id, parsedProductId]
      );

      const nextQuantity = Number(existingItemResult.rows[0]?.quantity || 0) + parsedQuantity;

      if (product.stock < nextQuantity) {
        throw new Error(`${product.name} does not have enough stock.`);
      }

      await client.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (cart_id, product_id)
         DO UPDATE SET
           quantity = cart_items.quantity + EXCLUDED.quantity,
           updated_at = CURRENT_TIMESTAMP`,
        [ensuredCart.id, parsedProductId, parsedQuantity]
      );

      return getCartSnapshot(client, cartToken);
    });

    response.status(201).json({ message: "Product added to cart.", cart });
  } catch (error) {
    if (error.message) {
      response.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function updateCartItem(request, response, next) {
  const { cartToken, productId, quantity } = request.body;
  const parsedQuantity = Number(quantity);
  const parsedProductId = Number(productId);

  if (!validateCartToken(cartToken)) {
    response.status(400).json({ message: "A valid cart token is required." });
    return;
  }

  if (!parsedProductId || Number.isNaN(parsedQuantity)) {
    response.status(400).json({ message: "Valid product and quantity are required." });
    return;
  }

  try {
    const cart = await withTransaction(async (client) => {
      const ensuredCart = await ensureCart(client, cartToken);

      if (parsedQuantity <= 0) {
        await client.query(
          `DELETE FROM cart_items
           WHERE cart_id = $1 AND product_id = $2`,
          [ensuredCart.id, parsedProductId]
        );

        return getCartSnapshot(client, cartToken);
      }

      const productResult = await client.query(
        `SELECT name, stock
         FROM products
         WHERE id = $1 AND is_active = TRUE`,
        [parsedProductId]
      );
      const product = productResult.rows[0];

      if (!product) {
        throw new Error("Selected product no longer exists.");
      }

      if (product.stock < parsedQuantity) {
        throw new Error(`${product.name} does not have enough stock.`);
      }

      await client.query(
        `UPDATE cart_items
         SET quantity = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE cart_id = $1 AND product_id = $2`,
        [ensuredCart.id, parsedProductId, parsedQuantity]
      );

      return getCartSnapshot(client, cartToken);
    });

    response.json({ message: "Cart updated.", cart });
  } catch (error) {
    if (error.message) {
      response.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function removeCartItem(request, response, next) {
  const { productId } = request.params;
  const { cartToken } = request.query;

  if (!validateCartToken(cartToken)) {
    response.status(400).json({ message: "A valid cart token is required." });
    return;
  }

  try {
    const cart = await withTransaction(async (client) => {
      const ensuredCart = await ensureCart(client, cartToken);
      await client.query(
        `DELETE FROM cart_items
         WHERE cart_id = $1 AND product_id = $2`,
        [ensuredCart.id, Number(productId)]
      );

      return getCartSnapshot(client, cartToken);
    });

    response.json({ message: "Item removed from cart.", cart });
  } catch (error) {
    next(error);
  }
}

export async function checkoutCart(request, response, next) {
  const validationMessage = validateCheckout(request.body);

  if (validationMessage) {
    response.status(400).json({ message: validationMessage });
    return;
  }

  try {
    const result = await withTransaction(async (client) => {
      const userId = await resolveActiveUserId(client, request.body.userId);
      const cart = await getCartSnapshot(client, request.body.cartToken.trim());

      if (!cart.items.length) {
        throw new Error("Cart is empty.");
      }

      const productIds = cart.items.map((item) => item.productId);
      const placeholders = productIds.map((_, index) => `$${index + 1}`).join(",");
      const productResult = await client.query(
        `SELECT id, name, stock
         FROM products
         WHERE id IN (${placeholders}) AND is_active = TRUE`,
        productIds
      );
      const stockMap = new Map(productResult.rows.map((product) => [product.id, product]));

      for (const item of cart.items) {
        const product = stockMap.get(item.productId);

        if (!product || product.stock < item.quantity) {
          throw new Error(`${item.name} does not have enough stock.`);
        }
      }

      const orderResult = await client.query(
        `INSERT INTO orders
         (user_id, customer_name, email, phone, address, city, postal_code, total_amount, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
         RETURNING id`,
        [
          userId,
          request.body.customerName.trim(),
          request.body.email.trim(),
          request.body.phone.trim(),
          request.body.address.trim(),
          request.body.city.trim(),
          request.body.postalCode.trim(),
          cart.subtotal
        ]
      );

      for (const item of cart.items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4)`,
          [orderResult.rows[0].id, item.productId, item.quantity, item.unitPrice]
        );

        await client.query(
          `UPDATE products
           SET stock = stock - $1
           WHERE id = $2`,
          [item.quantity, item.productId]
        );
      }

      await client.query(
        `DELETE FROM cart_items
         WHERE cart_id = (SELECT id FROM carts WHERE cart_token = $1)`,
        [request.body.cartToken.trim()]
      );

      return {
        orderId: orderResult.rows[0].id,
        totalAmount: cart.subtotal
      };
    });

    response.status(201).json({
      message: "Order placed successfully.",
      orderId: result.orderId,
      totalAmount: result.totalAmount
    });
  } catch (error) {
    if (error.message) {
      response.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
}
