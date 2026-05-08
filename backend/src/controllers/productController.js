import { query } from "../config/db.js";

function parsePositiveInt(value, fallback) {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

function normalizeConfiguration(configuration) {
  return configuration && typeof configuration === "object" ? configuration : {};
}

async function loadProductDetailsByParam(pathParam) {
  const products = await query(
    `SELECT
       p.id,
       p.slug,
       p.name,
       p.description,
       p.category,
       p.price,
       p.special_price AS "specialPrice",
       p.image_url AS "imageUrl",
       COALESCE(vs.total_stock, p.stock)::int AS stock,
       EXISTS (
         SELECT 1
         FROM product_variants pvx
         WHERE pvx.product_id = p.id
       ) AS "hasVariants"
     FROM products p
     LEFT JOIN (
       SELECT product_id, SUM(stock)::int AS total_stock
       FROM product_variants
       GROUP BY product_id
     ) vs
       ON vs.product_id = p.id
     WHERE p.is_active = TRUE
       AND (p.slug = $1 OR CAST(p.id AS TEXT) = $1)
     LIMIT 1`,
    [pathParam]
  );
  const product = products[0];

  if (!product) {
    return null;
  }

  const images = await query(
    `SELECT
       id,
       image_url AS "imageUrl",
       sort_order AS "sortOrder"
     FROM product_images
     WHERE product_id = $1
     ORDER BY sort_order ASC, id ASC`,
    [product.id]
  );

  const variants = await query(
    `SELECT
       id,
       sku,
       configuration,
       price,
       special_price AS "specialPrice",
       stock,
       image_url AS "imageUrl",
       is_default AS "isDefault"
     FROM product_variants
     WHERE product_id = $1
     ORDER BY is_default DESC, id ASC`,
    [product.id]
  );

  return {
    ...product,
    images: images.length
      ? images
      : [
          {
            id: `fallback-${product.id}`,
            imageUrl: product.imageUrl,
            sortOrder: 0
          }
        ],
    variants: variants.map((variant) => ({
      ...variant,
      stock: Number(variant.stock || 0),
      configuration: normalizeConfiguration(variant.configuration)
    }))
  };
}

export async function getProducts(request, response, next) {
  try {
    const params = [];
    const whereClauses = [`p.is_active = TRUE`];
    const category = request.query.category?.trim?.();
    const searchQuery = request.query.q?.trim?.();
    const stockFilter = request.query.stock?.trim?.();
    const priceFilter = request.query.price?.trim?.();
    const sortBy = request.query.sort?.trim?.() || "featured";
    const page = parsePositiveInt(request.query.page, null);
    const pageSize = parsePositiveInt(request.query.pageSize, 9);

    if (category && category !== "All") {
      params.push(category);
      whereClauses.push(`p.category = $${params.length}`);
    }

    if (searchQuery) {
      params.push(`%${searchQuery.toLowerCase()}%`);
      whereClauses.push(
        `(LOWER(p.name) LIKE $${params.length}
          OR LOWER(p.category) LIKE $${params.length}
          OR LOWER(p.description) LIKE $${params.length})`
      );
    }

    if (stockFilter === "in-stock") {
      whereClauses.push(`COALESCE(vs.total_stock, p.stock) > 0`);
    }

    if (priceFilter === "under-200") {
      whereClauses.push(`COALESCE(p.special_price, p.price) < 200`);
    } else if (priceFilter === "200-260") {
      whereClauses.push(`COALESCE(p.special_price, p.price) BETWEEN 200 AND 260`);
    } else if (priceFilter === "over-260") {
      whereClauses.push(`COALESCE(p.special_price, p.price) > 260`);
    }

    let orderByClause = `p.created_at DESC`;

    if (sortBy === "price-low") {
      orderByClause = `COALESCE(p.special_price, p.price) ASC, p.created_at DESC`;
    } else if (sortBy === "price-high") {
      orderByClause = `COALESCE(p.special_price, p.price) DESC, p.created_at DESC`;
    } else if (sortBy === "name-asc") {
      orderByClause = `p.name ASC`;
    } else if (sortBy === "newest") {
      orderByClause = `p.created_at DESC`;
    }

    const whereSql = whereClauses.join(" AND ");
    const totalCountResult = await query(
      `SELECT COUNT(*)::int AS "totalCount"
       FROM products p
       LEFT JOIN (
         SELECT product_id, SUM(stock)::int AS total_stock
         FROM product_variants
         GROUP BY product_id
       ) vs
         ON vs.product_id = p.id
       WHERE ${whereSql}`,
      params
    );
    const totalCount = Number(totalCountResult[0]?.totalCount || 0);

    const dataParams = [...params];
    let limitOffsetClause = "";

    if (page) {
      dataParams.push(pageSize);
      dataParams.push((page - 1) * pageSize);
      limitOffsetClause = ` LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`;
    }

    const products = await query(
      `SELECT
         p.id,
         p.slug,
         p.name,
         p.description,
         p.category,
         p.price,
         p.special_price AS "specialPrice",
         p.image_url AS "imageUrl",
         COALESCE(vs.total_stock, p.stock)::int AS stock,
         EXISTS (
           SELECT 1
           FROM product_variants pvx
           WHERE pvx.product_id = p.id
         ) AS "hasVariants"
       FROM products p
       LEFT JOIN (
         SELECT product_id, SUM(stock)::int AS total_stock
         FROM product_variants
         GROUP BY product_id
       ) vs
         ON vs.product_id = p.id
       WHERE ${whereSql}
       ORDER BY ${orderByClause}${limitOffsetClause}`,
      dataParams
    );

    response.json({
      products,
      pagination: {
        page: page || 1,
        pageSize: page ? pageSize : totalCount || products.length || 1,
        totalCount,
        totalPages: page ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductByPathParam(request, response, next) {
  try {
    const pathParam = request.params.pathParam?.trim?.();

    if (!pathParam) {
      response.status(400).json({ message: "A valid product identifier is required." });
      return;
    }

    const product = await loadProductDetailsByParam(pathParam);

    if (!product) {
      response.status(404).json({ message: "Product not found." });
      return;
    }

    response.json({ product });
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
