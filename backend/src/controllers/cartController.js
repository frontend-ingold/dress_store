import { withTransaction } from "../config/db.js";

function validateCartToken(cartToken) {
  return typeof cartToken === "string" && cartToken.trim().length >= 8;
}

function validateCheckout(body) {
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

  if (!validateCartToken(body.cartToken)) {
    return "A valid cart token is required.";
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

async function loadProductSelection(client, productId, variantId = null) {
  const productResult = await client.query(
    `SELECT id, slug, name, category, price, special_price AS "specialPrice", image_url AS "imageUrl", stock
     FROM products
     WHERE id = $1
       AND is_active = TRUE
     LIMIT 1`,
    [productId]
  );
  const product = productResult.rows[0];

  if (!product) {
    throw new Error("Selected product no longer exists.");
  }

  if (!variantId) {
    return {
      product,
      variant: null,
      stock: Number(product.stock || 0),
      unitPrice: Number(product.specialPrice ?? product.price ?? 0),
      imageUrl: product.imageUrl
    };
  }

  const variantResult = await client.query(
    `SELECT
       id,
       product_id AS "productId",
       sku,
       configuration,
       price,
       special_price AS "specialPrice",
       stock,
       image_url AS "imageUrl"
     FROM product_variants
     WHERE id = $1
       AND product_id = $2
     LIMIT 1`,
    [variantId, productId]
  );
  const variant = variantResult.rows[0];

  if (!variant) {
    throw new Error("Selected product configuration is unavailable.");
  }

  return {
    product,
    variant: {
      ...variant,
      configuration:
        variant.configuration && typeof variant.configuration === "object"
          ? variant.configuration
          : {}
    },
    stock: Number(variant.stock || 0),
    unitPrice: Number(variant.specialPrice ?? variant.price ?? 0),
    imageUrl: variant.imageUrl || product.imageUrl
  };
}

async function getExistingCartItem(client, cartId, productId, variantId = null) {
  const itemResult = await client.query(
    `SELECT id, quantity
     FROM cart_items
     WHERE cart_id = $1
       AND product_id = $2
       AND (
         ($3::int IS NULL AND product_variant_id IS NULL)
         OR product_variant_id = $3
       )
     LIMIT 1`,
    [cartId, productId, variantId]
  );

  return itemResult.rows[0] || null;
}

async function getCartSnapshot(client, cartToken) {
  const cart = await ensureCart(client, cartToken);
  const itemsResult = await client.query(
    `SELECT
       ci.id AS "cartItemId",
       ci.product_id AS "productId",
       ci.product_variant_id AS "productVariantId",
       ci.quantity,
       p.slug,
       p.name,
       p.category,
       p.price,
       p.special_price AS "specialPrice",
       p.image_url AS "baseImageUrl",
       p.stock AS "productStock",
       pv.sku AS "variantSku",
       pv.configuration AS "variantConfiguration",
       pv.price AS "variantPrice",
       pv.special_price AS "variantSpecialPrice",
       pv.stock AS "variantStock",
       pv.image_url AS "variantImageUrl"
     FROM cart_items ci
     JOIN products p
       ON p.id = ci.product_id
     LEFT JOIN product_variants pv
       ON pv.id = ci.product_variant_id
     WHERE ci.cart_id = $1
       AND p.is_active = TRUE
     ORDER BY ci.created_at DESC`,
    [cart.id]
  );

  const items = itemsResult.rows.map((item) => {
    const variantConfiguration =
      item.variantConfiguration && typeof item.variantConfiguration === "object"
        ? item.variantConfiguration
        : null;
    const quantity = Number(item.quantity);
    const unitPrice = Number(
      item.variantSpecialPrice ?? item.variantPrice ?? item.specialPrice ?? item.price
    );

    return {
      cartItemId: item.cartItemId,
      productId: item.productId,
      productVariantId: item.productVariantId,
      quantity,
      slug: item.slug,
      name: item.name,
      category: item.category,
      price: item.price,
      specialPrice: item.specialPrice,
      imageUrl: item.variantImageUrl || item.baseImageUrl,
      stock: Number(item.variantStock ?? item.productStock ?? 0),
      variantSku: item.variantSku,
      variantConfiguration,
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
  const { cartToken, productId, variantId = null, quantity = 1 } = request.body;
  const parsedQuantity = Number(quantity);
  const parsedProductId = Number(productId);
  const parsedVariantId = variantId ? Number(variantId) : null;

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
      const selection = await loadProductSelection(client, parsedProductId, parsedVariantId);
      const existingItem = await getExistingCartItem(
        client,
        ensuredCart.id,
        parsedProductId,
        parsedVariantId
      );
      const nextQuantity = Number(existingItem?.quantity || 0) + parsedQuantity;

      if (selection.stock < nextQuantity) {
        throw new Error(`${selection.product.name} does not have enough stock.`);
      }

      if (existingItem) {
        await client.query(
          `UPDATE cart_items
           SET quantity = $2,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [existingItem.id, nextQuantity]
        );
      } else {
        await client.query(
          `INSERT INTO cart_items (cart_id, product_id, product_variant_id, quantity)
           VALUES ($1, $2, $3, $4)`,
          [ensuredCart.id, parsedProductId, parsedVariantId, parsedQuantity]
        );
      }

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
  const { cartToken, cartItemId, quantity } = request.body;
  const parsedQuantity = Number(quantity);
  const parsedCartItemId = Number(cartItemId);

  if (!validateCartToken(cartToken)) {
    response.status(400).json({ message: "A valid cart token is required." });
    return;
  }

  if (!parsedCartItemId || Number.isNaN(parsedQuantity)) {
    response.status(400).json({ message: "Valid cart item and quantity are required." });
    return;
  }

  try {
    const cart = await withTransaction(async (client) => {
      const ensuredCart = await ensureCart(client, cartToken);
      const itemResult = await client.query(
        `SELECT id, product_id AS "productId", product_variant_id AS "productVariantId"
         FROM cart_items
         WHERE id = $1
           AND cart_id = $2
         LIMIT 1`,
        [parsedCartItemId, ensuredCart.id]
      );
      const cartItem = itemResult.rows[0];

      if (!cartItem) {
        throw new Error("Selected cart item no longer exists.");
      }

      if (parsedQuantity <= 0) {
        await client.query(`DELETE FROM cart_items WHERE id = $1`, [parsedCartItemId]);
        return getCartSnapshot(client, cartToken);
      }

      const selection = await loadProductSelection(
        client,
        cartItem.productId,
        cartItem.productVariantId
      );

      if (selection.stock < parsedQuantity) {
        throw new Error(`${selection.product.name} does not have enough stock.`);
      }

      await client.query(
        `UPDATE cart_items
         SET quantity = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [parsedCartItemId, parsedQuantity]
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
  const { cartItemId } = request.params;
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
         WHERE id = $1
           AND cart_id = $2`,
        [Number(cartItemId), ensuredCart.id]
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

      for (const item of cart.items) {
        const selection = await loadProductSelection(
          client,
          item.productId,
          item.productVariantId
        );

        if (selection.stock < item.quantity) {
          throw new Error(`${item.name} does not have enough stock.`);
        }
      }

      const deliveryFee = DELIVERY_FEE;
      const grandTotal = Number((cart.subtotal + deliveryFee).toFixed(2));

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
          deliveryFee,
          cart.subtotal,
          grandTotal
        ]
      );

      for (const item of cart.items) {
        await client.query(
          `INSERT INTO order_items
           (order_id, product_id, product_variant_id, variant_configuration, quantity, unit_price)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            orderResult.rows[0].id,
            item.productId,
            item.productVariantId,
            item.variantConfiguration ? JSON.stringify(item.variantConfiguration) : null,
            item.quantity,
            item.unitPrice
          ]
        );

        if (item.productVariantId) {
          await client.query(
            `UPDATE product_variants
             SET stock = stock - $1
             WHERE id = $2`,
            [item.quantity, item.productVariantId]
          );
        } else {
          await client.query(
            `UPDATE products
             SET stock = stock - $1
             WHERE id = $2`,
            [item.quantity, item.productId]
          );
        }
      }

      await client.query(
        `DELETE FROM cart_items
         WHERE cart_id = (SELECT id FROM carts WHERE cart_token = $1)`,
        [request.body.cartToken.trim()]
      );

      return {
        orderId: orderResult.rows[0].id,
        totalAmount: cart.subtotal,
        deliveryFee,
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
