-- Seed sample stores for demonstration (mix of different chains)
-- Note: These are sample locations - in production, you'd import real store data

INSERT INTO public.stores (name, chain, address, city, state, zip_code, latitude, longitude, phone) VALUES
  ('Walmart Supercenter', 'Walmart', '123 Main St', 'Springfield', 'IL', '62701', 39.7817, -89.6501, '(555) 123-4567'),
  ('Target', 'Target', '456 Oak Ave', 'Springfield', 'IL', '62702', 39.7892, -89.6543, '(555) 234-5678'),
  ('Kroger', 'Kroger', '789 Elm St', 'Springfield', 'IL', '62703', 39.7756, -89.6612, '(555) 345-6789'),
  ('Aldi', 'Aldi', '321 Maple Dr', 'Springfield', 'IL', '62704', 39.7923, -89.6478, '(555) 456-7890'),
  ('Whole Foods Market', 'Whole Foods', '654 Pine Rd', 'Springfield', 'IL', '62705', 39.7845, -89.6590, '(555) 567-8901'),
  ('Safeway', 'Safeway', '987 Cedar Ln', 'Springfield', 'IL', '62706', 39.7778, -89.6534, '(555) 678-9012'),
  ('Costco Wholesale', 'Costco', '147 Market Blvd', 'Springfield', 'IL', '62707', 39.7934, -89.6623, '(555) 789-0123'),
  ('Trader Joe''s', 'Trader Joe''s', '258 Commerce Way', 'Springfield', 'IL', '62708', 39.7801, -89.6445, '(555) 890-1234');

-- Seed sample product prices for common grocery items
INSERT INTO public.product_prices (store_id, product_name, category, price, unit) 
SELECT 
  s.id,
  p.name,
  p.category,
  p.base_price + (RANDOM() * 3 - 1.5)::DECIMAL(10,2), -- Randomize prices by +/- $1.50
  p.unit
FROM public.stores s
CROSS JOIN (
  VALUES 
    ('Milk', 'Dairy', 3.99, 'gallon'),
    ('Eggs', 'Dairy', 4.49, 'dozen'),
    ('Bread', 'Bakery', 2.99, 'loaf'),
    ('Chicken Breast', 'Meat', 8.99, 'lb'),
    ('Ground Beef', 'Meat', 6.99, 'lb'),
    ('Bananas', 'Produce', 0.59, 'lb'),
    ('Apples', 'Produce', 1.99, 'lb'),
    ('Tomatoes', 'Produce', 2.49, 'lb'),
    ('Lettuce', 'Produce', 1.99, 'head'),
    ('Rice', 'Grains', 12.99, '20lb bag'),
    ('Pasta', 'Grains', 1.49, 'box'),
    ('Orange Juice', 'Beverages', 4.99, 'half gallon'),
    ('Coffee', 'Beverages', 8.99, '12oz bag'),
    ('Yogurt', 'Dairy', 5.99, '32oz'),
    ('Cheese', 'Dairy', 4.99, '8oz'),
    ('Butter', 'Dairy', 3.99, '1lb'),
    ('Cereal', 'Grains', 4.49, 'box'),
    ('Peanut Butter', 'Condiments', 3.99, 'jar'),
    ('Olive Oil', 'Condiments', 9.99, 'bottle'),
    ('Canned Beans', 'Canned', 1.29, 'can')
) AS p(name, category, base_price, unit);
