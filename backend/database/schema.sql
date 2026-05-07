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
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT cart_items_cart_product_unique UNIQUE (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(80) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
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
