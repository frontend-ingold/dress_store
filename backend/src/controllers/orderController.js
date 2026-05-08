import { query, withTransaction } from "../config/db.js";

function validateOrder(body) {
  const requiredFields = ["customerName", "email", "phone", "address", "city", "postalCode"];
  const missingField = requiredFields.find((field) => !body[field]?.trim?.());

  if (missingField) {
    return `Missing required field: ${missingField}`;
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return "Order must include at least one product.";
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

export async function createOrder(request, response, next) {
  const validationMessage = validateOrder(request.body);

  if (validationMessage) {
    response.status(400).json({ message: validationMessage });
    return;
  }

  try {
    const orderId = await withTransaction(async (client) => {
      const userId = await resolveActiveUserId(client, request.body.userId);
      const productIds = request.body.items.map((item) => item.productId);
      const placeholders = productIds.map((_, index) => `$${index + 1}`).join(",");

      const productsResult = await client.query(
        `SELECT id, name, price, special_price AS "specialPrice", stock
         FROM products
         WHERE id IN (${placeholders}) AND is_active = TRUE`,
        productIds
      );
      const products = productsResult.rows;

      if (products.length !== request.body.items.length) {
        throw new Error("One or more selected products no longer exist.");
      }

      const productMap = new Map(products.map((product) => [product.id, product]));
      let orderTotal = 0;

      for (const item of request.body.items) {
        const product = productMap.get(item.productId);
        const quantity = Number(item.quantity || 0);
        const effectivePrice = Number(product?.specialPrice ?? product?.price ?? 0);

        if (!product || quantity < 1) {
          throw new Error("Invalid order quantity.");
        }

        if (product.stock < quantity) {
          throw new Error(`${product.name} does not have enough stock.`);
        }

        orderTotal += effectivePrice * quantity;
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
          orderTotal
        ]
      );

      for (const item of request.body.items) {
        const product = productMap.get(item.productId);
        const quantity = Number(item.quantity);
        const effectivePrice = Number(product.specialPrice ?? product.price);

        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4)`,
          [orderResult.rows[0].id, item.productId, quantity, effectivePrice]
        );

        await client.query(`UPDATE products SET stock = stock - $1 WHERE id = $2`, [
          quantity,
          item.productId
        ]);
      }

      return orderResult.rows[0].id;
    });

    response.status(201).json({ message: "Order placed successfully.", orderId });
  } catch (error) {
    if (error.message) {
      response.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function getOrdersByUser(request, response, next) {
  const userId = Number(request.params.userId);

  if (!Number.isInteger(userId) || userId < 1) {
    response.status(400).json({ message: "A valid user id is required." });
    return;
  }

  try {
    const users = await query(
      `SELECT id, email
       FROM users
       WHERE id = $1
         AND is_active = TRUE
       LIMIT 1`,
      [userId]
    );
    const user = users[0];

    if (!user) {
      response.status(404).json({ message: "User not found." });
      return;
    }

    const rows = await query(
      `SELECT
         o.id AS "orderId",
         o.user_id AS "userId",
         o.customer_name AS "customerName",
         o.email,
         o.phone,
         o.address,
         o.city,
         o.postal_code AS "postalCode",
         o.total_amount AS "totalAmount",
         o.status,
         o.created_at AS "createdAt",
         oi.product_id AS "productId",
         oi.quantity,
         oi.unit_price AS "unitPrice",
         p.slug,
         p.name,
         p.image_url AS "imageUrl"
       FROM orders o
       LEFT JOIN order_items oi
         ON oi.order_id = o.id
       LEFT JOIN products p
         ON p.id = oi.product_id
       WHERE o.user_id = $1
          OR (o.user_id IS NULL AND LOWER(o.email) = LOWER($2))
       ORDER BY o.created_at DESC, oi.id ASC`,
      [userId, user.email]
    );

    const orderMap = new Map();

    for (const row of rows) {
      if (!orderMap.has(row.orderId)) {
        orderMap.set(row.orderId, {
          orderId: row.orderId,
          userId: row.userId,
          customerName: row.customerName,
          email: row.email,
          phone: row.phone,
          address: row.address,
          city: row.city,
          postalCode: row.postalCode,
          totalAmount: Number(row.totalAmount || 0),
          status: row.status || "pending",
          createdAt: row.createdAt,
          items: []
        });
      }

      if (row.productId) {
        orderMap.get(row.orderId).items.push({
          productId: row.productId,
          slug: row.slug,
          name: row.name,
          imageUrl: row.imageUrl,
          quantity: Number(row.quantity || 0),
          unitPrice: Number(row.unitPrice || 0),
          lineTotal: Number(row.quantity || 0) * Number(row.unitPrice || 0)
        });
      }
    }

    response.json({
      orders: Array.from(orderMap.values())
    });
  } catch (error) {
    next(error);
  }
}
