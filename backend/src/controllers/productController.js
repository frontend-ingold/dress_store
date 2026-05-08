import { query } from "../config/db.js";

function parsePositiveInt(value, fallback) {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

export async function getProducts(request, response, next) {
  try {
    const params = [];
    const whereClauses = [`is_active = TRUE`];
    const category = request.query.category?.trim?.();
    const searchQuery = request.query.q?.trim?.();
    const stockFilter = request.query.stock?.trim?.();
    const priceFilter = request.query.price?.trim?.();
    const sortBy = request.query.sort?.trim?.() || "featured";
    const page = parsePositiveInt(request.query.page, null);
    const pageSize = parsePositiveInt(request.query.pageSize, 9);

    if (category && category !== "All") {
      params.push(category);
      whereClauses.push(`category = $${params.length}`);
    }

    if (searchQuery) {
      params.push(`%${searchQuery.toLowerCase()}%`);
      whereClauses.push(
        `(LOWER(name) LIKE $${params.length}
          OR LOWER(category) LIKE $${params.length}
          OR LOWER(description) LIKE $${params.length})`
      );
    }

    if (stockFilter === "in-stock") {
      whereClauses.push(`stock > 0`);
    }

    if (priceFilter === "under-200") {
      whereClauses.push(`COALESCE(special_price, price) < 200`);
    } else if (priceFilter === "200-260") {
      whereClauses.push(`COALESCE(special_price, price) BETWEEN 200 AND 260`);
    } else if (priceFilter === "over-260") {
      whereClauses.push(`COALESCE(special_price, price) > 260`);
    }

    let orderByClause = `created_at DESC`;

    if (sortBy === "price-low") {
      orderByClause = `COALESCE(special_price, price) ASC, created_at DESC`;
    } else if (sortBy === "price-high") {
      orderByClause = `COALESCE(special_price, price) DESC, created_at DESC`;
    } else if (sortBy === "name-asc") {
      orderByClause = `name ASC`;
    } else if (sortBy === "newest") {
      orderByClause = `created_at DESC`;
    }

    const whereSql = whereClauses.join(" AND ");
    const totalCountResult = await query(
      `SELECT COUNT(*)::int AS "totalCount"
       FROM products
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
