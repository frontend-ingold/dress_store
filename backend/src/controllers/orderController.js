import { query, withTransaction } from "../config/db.js";

function validateOrder(body) {
  const requiredFields = [
    "customerName",
    "email",
    "phone",
    "address",
    "city",
    "state",
    "postalCode",
    "country"
  ];
  const missingField = requiredFields.find((field) => !body[field]?.trim?.());

  if (missingField) {
    return `Missing required field: ${missingField}`;
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return "Order must include at least one product.";
  }

  return null;
}

const DELIVERY_FEE = 15;

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
    const result = await withTransaction(async (client) => {
      const userId = await resolveActiveUserId(client, request.body.userId);
      const productIds = Array.from(new Set(request.body.items.map((item) => Number(item.productId))));
      const variantIds = request.body.items
        .map((item) => Number(item.variantId || item.productVariantId || 0))
        .filter((item) => item > 0);
      const placeholders = productIds.map((_, index) => `$${index + 1}`).join(",");

      const productsResult = await client.query(
        `SELECT id, name, price, special_price AS "specialPrice", stock
         FROM products
         WHERE id IN (${placeholders}) AND is_active = TRUE`,
        productIds
      );
      const products = productsResult.rows;
      const variantsResult = variantIds.length
        ? await client.query(
            `SELECT
               id,
               product_id AS "productId",
               configuration,
               price,
               special_price AS "specialPrice",
               stock
             FROM product_variants
             WHERE id = ANY($1::int[])`,
            [variantIds]
          )
        : { rows: [] };
      const variants = variantsResult.rows;

      if (products.length !== productIds.length) {
        throw new Error("One or more selected products no longer exist.");
      }

      const productMap = new Map(products.map((product) => [product.id, product]));
      const variantMap = new Map(variants.map((variant) => [variant.id, variant]));
      let orderTotal = 0;

      for (const item of request.body.items) {
        const product = productMap.get(item.productId);
        const variantId = Number(item.variantId || item.productVariantId || 0) || null;
        const variant = variantId ? variantMap.get(variantId) : null;
        const quantity = Number(item.quantity || 0);
        const effectivePrice = Number(
          variant?.specialPrice ?? variant?.price ?? product?.specialPrice ?? product?.price ?? 0
        );
        const availableStock = Number(variant?.stock ?? product?.stock ?? 0);

        if (!product || quantity < 1) {
          throw new Error("Invalid order quantity.");
        }

        if (variantId && (!variant || variant.productId !== product.id)) {
          throw new Error("Invalid product configuration.");
        }

        if (availableStock < quantity) {
          throw new Error(`${product.name} does not have enough stock.`);
        }

        orderTotal += effectivePrice * quantity;
      }

      const grandTotal = Number((orderTotal + DELIVERY_FEE).toFixed(2));

      const orderResult = await client.query(
        `INSERT INTO orders
         (
           user_id,
           customer_name,
           email,
           phone,
           address,
           address_line_2,
           city,
           state,
           postal_code,
           country,
           delivery_fee,
           total_amount,
           grand_total,
           status
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending')
         RETURNING id`,
        [
          userId,
          request.body.customerName.trim(),
          request.body.email.trim(),
          request.body.phone.trim(),
          request.body.address.trim(),
          request.body.addressLine2?.trim?.() || "",
          request.body.city.trim(),
          request.body.state.trim(),
          request.body.postalCode.trim(),
          request.body.country.trim(),
          DELIVERY_FEE,
          orderTotal,
          grandTotal
        ]
      );

      for (const item of request.body.items) {
        const product = productMap.get(item.productId);
        const variantId = Number(item.variantId || item.productVariantId || 0) || null;
        const variant = variantId ? variantMap.get(variantId) : null;
        const quantity = Number(item.quantity);
        const effectivePrice = Number(
          variant?.specialPrice ?? variant?.price ?? product.specialPrice ?? product.price
        );

        await client.query(
          `INSERT INTO order_items
           (order_id, product_id, product_variant_id, variant_configuration, quantity, unit_price)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            orderResult.rows[0].id,
            item.productId,
            variantId,
            variant?.configuration ? JSON.stringify(variant.configuration) : null,
            quantity,
            effectivePrice
          ]
        );

        if (variantId) {
          await client.query(`UPDATE product_variants SET stock = stock - $1 WHERE id = $2`, [
            quantity,
            variantId
          ]);
        } else {
          await client.query(`UPDATE products SET stock = stock - $1 WHERE id = $2`, [
            quantity,
            item.productId
          ]);
        }
      }

      return {
        orderId: orderResult.rows[0].id,
        totalAmount: orderTotal,
        deliveryFee: DELIVERY_FEE,
        grandTotal
      };
    });

    response.status(201).json({
      message: "Order placed successfully.",
      orderId: result.orderId,
      totalAmount: result.totalAmount,
      deliveryFee: result.deliveryFee,
      grandTotal: result.grandTotal
    });
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
         o.address_line_2 AS "addressLine2",
         o.city,
         o.state,
         o.postal_code AS "postalCode",
         o.country,
         o.delivery_fee AS "deliveryFee",
         o.total_amount AS "totalAmount",
         o.grand_total AS "grandTotal",
         o.status,
         o.created_at AS "createdAt",
         oi.product_id AS "productId",
         oi.product_variant_id AS "productVariantId",
         oi.variant_configuration AS "variantConfiguration",
         oi.quantity,
         oi.unit_price AS "unitPrice",
         p.slug,
         p.name,
         COALESCE(pv.image_url, p.image_url) AS "imageUrl"
       FROM orders o
       LEFT JOIN order_items oi
         ON oi.order_id = o.id
       LEFT JOIN products p
         ON p.id = oi.product_id
       LEFT JOIN product_variants pv
         ON pv.id = oi.product_variant_id
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
          addressLine2: row.addressLine2,
          city: row.city,
          state: row.state,
          postalCode: row.postalCode,
          country: row.country,
          deliveryFee: Number(row.deliveryFee || 0),
          totalAmount: Number(row.totalAmount || 0),
          grandTotal: Number(row.grandTotal || row.totalAmount || 0),
          status: row.status || "pending",
          createdAt: row.createdAt,
          items: []
        });
      }

      if (row.productId) {
        orderMap.get(row.orderId).items.push({
          productId: row.productId,
          productVariantId: row.productVariantId,
          slug: row.slug,
          name: row.name,
          imageUrl: row.imageUrl,
          variantConfiguration:
            row.variantConfiguration && typeof row.variantConfiguration === "object"
              ? row.variantConfiguration
              : null,
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
