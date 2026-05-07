import { withTransaction } from "../config/db.js";

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

export async function createOrder(request, response, next) {
  const validationMessage = validateOrder(request.body);

  if (validationMessage) {
    response.status(400).json({ message: validationMessage });
    return;
  }

  try {
    const orderId = await withTransaction(async (client) => {
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
         (customer_name, email, phone, address, city, postal_code, total_amount, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
         RETURNING id`,
        [
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
