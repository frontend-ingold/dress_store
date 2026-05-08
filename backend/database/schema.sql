CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(220),
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(80) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  special_price DECIMAL(10, 2),
  image_url VARCHAR(255) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE products
ADD COLUMN IF NOT EXISTS special_price DECIMAL(10, 2);

ALTER TABLE products
ADD COLUMN IF NOT EXISTS slug VARCHAR(220);

CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS product_images_product_sort_unique_idx
  ON product_images (product_id, sort_order);

CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  sku VARCHAR(120) NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  price DECIMAL(10, 2) NOT NULL,
  special_price DECIMAL(10, 2),
  stock INT NOT NULL DEFAULT 0,
  image_url VARCHAR(255),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_variants_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS product_variants_sku_unique_idx
  ON product_variants (sku);

WITH slug_source AS (
  SELECT
    id,
    TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(name), '[^a-z0-9]+', '-', 'g')) AS base_slug,
    ROW_NUMBER() OVER (
      PARTITION BY TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(name), '[^a-z0-9]+', '-', 'g'))
      ORDER BY id
    ) AS slug_rank
  FROM products
  WHERE slug IS NULL OR slug = ''
)
UPDATE products p
SET slug = CASE
  WHEN s.slug_rank = 1 THEN s.base_slug
  ELSE CONCAT(s.base_slug, '-', p.id)
END
FROM slug_source s
WHERE p.id = s.id;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique_idx ON products (slug);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(120) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_password_reset_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  cart_token VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  product_variant_id INT,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

ALTER TABLE cart_items
ADD COLUMN IF NOT EXISTS product_variant_id INT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cart_items_cart_product_unique'
  ) THEN
    ALTER TABLE cart_items DROP CONSTRAINT cart_items_cart_product_unique;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_cart_items_product_variant'
  ) THEN
    ALTER TABLE cart_items
    ADD CONSTRAINT fk_cart_items_product_variant
    FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS cart_items_cart_product_variant_unique_idx
  ON cart_items (cart_id, product_id, COALESCE(product_variant_id, 0));

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT,
  customer_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  address VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(80) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100),
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL,
  grand_total DECIMAL(10, 2),
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS user_id INT;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS address_line_2 VARCHAR(255);

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS state VARCHAR(100);

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS country VARCHAR(100);

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS grand_total DECIMAL(10, 2);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_orders_user'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_variant_id INT,
  variant_configuration JSONB,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_order_items_product_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_variant_id INT;

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS variant_configuration JSONB;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_order_items_product_variant'
  ) THEN
    ALTER TABLE order_items
    ADD CONSTRAINT fk_order_items_product_variant
    FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT favorites_user_product_unique UNIQUE (user_id, product_id)
);

WITH category_seed AS (
  SELECT *
  FROM (
    VALUES
      ('Evening Elegance', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80', 'Floor-skimming silhouettes with polished structure for after-dark dressing.', 265),
      ('Casual Luxe', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80', 'Relaxed luxury styles designed for brunches, city walks, and easy daytime polish.', 145),
      ('Summer Florals', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80', 'Fresh florals and light movement for warm weather events and garden celebrations.', 155),
      ('Occasion Wear', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', 'Statement dresses with clean lines and elevated fabric stories for key occasions.', 235),
      ('Cocktail Edit', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', 'Party-driven midis and minis with sharper lines and a confident social mood.', 195),
      ('Resort Escape', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80', 'Holiday-ready dresses with easy drape, lighter palettes, and destination styling.', 165),
      ('Wedding Guest', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80', 'Refined looks for receptions, ceremonies, and elegant guest dressing.', 225),
      ('Office Chic', 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=900&q=80', 'Structured day dresses that balance sophistication, comfort, and work-ready polish.', 175),
      ('Minimal Classics', 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?auto=format&fit=crop&w=900&q=80', 'Timeless wardrobe staples with understated detailing and a clean modern finish.', 185),
      ('Festive Glam', 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=900&q=80', 'Rich color, soft sheen, and celebratory styling for festive calendars.', 205)
  ) AS seed(category, image_url, base_description, base_price)
),
number_seed AS (
  SELECT generate_series(1, 10) AS item_no
)
INSERT INTO products (slug, name, description, category, price, special_price, image_url, stock)
SELECT
  CONCAT(
    TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(category), '[^a-z0-9]+', '-', 'g')),
    '-',
    CASE (item_no - 1) % 5
      WHEN 0 THEN 'silhouette'
      WHEN 1 THEN 'atelier'
      WHEN 2 THEN 'signature'
      WHEN 3 THEN 'studio'
      ELSE 'muse'
    END,
    '-dress-',
    LPAD(item_no::text, 2, '0')
  ) AS slug,
  CONCAT(
    SPLIT_PART(category, ' ', 1),
    ' ',
    CASE (item_no - 1) % 5
      WHEN 0 THEN 'Silhouette'
      WHEN 1 THEN 'Atelier'
      WHEN 2 THEN 'Signature'
      WHEN 3 THEN 'Studio'
      ELSE 'Muse'
    END,
    ' Dress ',
    LPAD(item_no::text, 2, '0')
  ) AS name,
  CONCAT(base_description, ' Edition ', item_no, ' introduces a refined take with boutique-led finishing and event-ready styling.') AS description,
  category,
  base_price + (item_no * 12) AS price,
  CASE
    WHEN item_no % 2 = 0 THEN ROUND(((base_price + (item_no * 12)) * 0.82)::numeric, 2)
    WHEN item_no % 3 = 0 THEN ROUND(((base_price + (item_no * 12)) * 0.88)::numeric, 2)
    ELSE NULL
  END AS special_price,
  image_url,
  8 + item_no AS stock
FROM category_seed
CROSS JOIN number_seed;

UPDATE products
SET special_price = CASE
  WHEN id % 2 = 0 THEN ROUND((price * 0.82)::numeric, 2)
  WHEN id % 3 = 0 THEN ROUND((price * 0.88)::numeric, 2)
  ELSE NULL
END;

INSERT INTO product_images (product_id, image_url, sort_order)
SELECT p.id, p.image_url, 0
FROM products p
ON CONFLICT (product_id, sort_order) DO NOTHING;

INSERT INTO product_images (product_id, image_url, sort_order)
SELECT
  p.id,
  CASE p.id % 6
    WHEN 0 THEN 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80'
    WHEN 1 THEN 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'
    WHEN 2 THEN 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80'
    WHEN 3 THEN 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
    WHEN 4 THEN 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=900&q=80'
    ELSE 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=900&q=80'
  END,
  1
FROM products p
ON CONFLICT (product_id, sort_order) DO NOTHING;

INSERT INTO product_images (product_id, image_url, sort_order)
SELECT
  p.id,
  CASE p.id % 6
    WHEN 0 THEN 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'
    WHEN 1 THEN 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
    WHEN 2 THEN 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'
    WHEN 3 THEN 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?auto=format&fit=crop&w=900&q=80'
    WHEN 4 THEN 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80'
    ELSE 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
  END,
  2
FROM products p
ON CONFLICT (product_id, sort_order) DO NOTHING;

WITH variant_colors AS (
  SELECT *
  FROM (
    VALUES
      ('Rose', 0),
      ('Midnight', 12),
      ('Ivory', 18)
  ) AS colors(color_name, color_delta)
),
variant_sizes AS (
  SELECT *
  FROM (
    VALUES
      ('S', 0),
      ('M', 8),
      ('L', 16)
  ) AS sizes(size_name, size_delta)
)
INSERT INTO product_variants (
  product_id,
  sku,
  configuration,
  price,
  special_price,
  stock,
  image_url,
  is_default
)
SELECT
  p.id,
  CONCAT(UPPER(REPLACE(p.slug, '-', '')), '-', UPPER(colors.color_name), '-', sizes.size_name),
  jsonb_build_object(
    'Color', colors.color_name,
    'Size', sizes.size_name
  ),
  p.price + colors.color_delta + sizes.size_delta,
  CASE
    WHEN p.special_price IS NOT NULL
      THEN ROUND((p.special_price + colors.color_delta + sizes.size_delta)::numeric, 2)
    ELSE NULL
  END,
  GREATEST(0, p.stock - (colors.color_delta / 6) - sizes.size_delta / 8),
  CASE colors.color_name
    WHEN 'Rose' THEN (
      SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.sort_order = 0
    )
    WHEN 'Midnight' THEN (
      SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.sort_order = 1
    )
    ELSE (
      SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.sort_order = 2
    )
  END,
  (colors.color_name = 'Rose' AND sizes.size_name = 'M')
FROM products p
CROSS JOIN variant_colors colors
CROSS JOIN variant_sizes sizes
ON CONFLICT (sku) DO NOTHING;
