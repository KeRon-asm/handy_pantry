-- Add more comprehensive product price data for common grocery items
-- This gives users a rich database to search through for price comparisons

INSERT INTO public.product_prices (store_id, product_name, category, price, unit) 
SELECT 
  s.id,
  p.name,
  p.category,
  p.base_price + (RANDOM() * 2 - 1)::DECIMAL(10,2), -- Randomize prices by +/- $1
  p.unit
FROM public.stores s
CROSS JOIN (
  VALUES 
    -- More Produce
    ('Strawberries', 'Produce', 4.99, 'lb'),
    ('Blueberries', 'Produce', 5.99, 'pint'),
    ('Grapes', 'Produce', 2.99, 'lb'),
    ('Oranges', 'Produce', 1.49, 'lb'),
    ('Carrots', 'Produce', 1.99, 'bag'),
    ('Broccoli', 'Produce', 2.49, 'lb'),
    ('Spinach', 'Produce', 3.99, 'bag'),
    ('Potatoes', 'Produce', 3.99, '5lb bag'),
    ('Onions', 'Produce', 1.99, 'lb'),
    ('Bell Peppers', 'Produce', 2.49, 'lb'),
    ('Cucumbers', 'Produce', 1.29, 'each'),
    ('Avocados', 'Produce', 1.99, 'each'),
    ('Lemons', 'Produce', 0.79, 'each'),
    ('Limes', 'Produce', 0.69, 'each'),
    
    -- More Dairy
    ('Sour Cream', 'Dairy', 2.99, '16oz'),
    ('Cream Cheese', 'Dairy', 2.49, '8oz'),
    ('Cottage Cheese', 'Dairy', 3.99, '16oz'),
    ('Shredded Cheese', 'Dairy', 3.49, '8oz'),
    ('String Cheese', 'Dairy', 4.99, 'pack'),
    
    -- More Meat
    ('Turkey Breast', 'Meat', 7.99, 'lb'),
    ('Pork Chops', 'Meat', 5.99, 'lb'),
    ('Ground Turkey', 'Meat', 5.49, 'lb'),
    ('Bacon', 'Meat', 6.99, '12oz'),
    ('Sausage', 'Meat', 4.99, 'lb'),
    ('Salmon', 'Meat', 12.99, 'lb'),
    ('Shrimp', 'Meat', 14.99, 'lb'),
    
    -- Frozen Foods
    ('Frozen Pizza', 'Frozen', 5.99, 'each'),
    ('Ice Cream', 'Frozen', 4.99, 'pint'),
    ('Frozen Vegetables', 'Frozen', 2.49, 'bag'),
    ('Frozen Fruit', 'Frozen', 3.99, 'bag'),
    ('Chicken Nuggets', 'Frozen', 7.99, 'bag'),
    ('French Fries', 'Frozen', 3.49, 'bag'),
    
    -- Snacks
    ('Potato Chips', 'Snacks', 3.99, 'bag'),
    ('Crackers', 'Snacks', 3.49, 'box'),
    ('Cookies', 'Snacks', 4.49, 'package'),
    ('Granola Bars', 'Snacks', 4.99, 'box'),
    ('Popcorn', 'Snacks', 3.99, 'box'),
    ('Pretzels', 'Snacks', 2.99, 'bag'),
    ('Nuts', 'Snacks', 8.99, 'bag'),
    
    -- Beverages
    ('Soda', 'Beverages', 5.99, '12-pack'),
    ('Water Bottles', 'Beverages', 4.99, '24-pack'),
    ('Tea', 'Beverages', 3.99, 'box'),
    ('Sports Drink', 'Beverages', 6.99, '8-pack'),
    ('Energy Drink', 'Beverages', 2.49, 'can'),
    
    -- Canned/Packaged
    ('Soup', 'Canned', 1.99, 'can'),
    ('Tomato Sauce', 'Canned', 1.49, 'jar'),
    ('Canned Tuna', 'Canned', 1.29, 'can'),
    ('Canned Corn', 'Canned', 0.99, 'can'),
    ('Chicken Broth', 'Canned', 2.49, 'carton'),
    
    -- Condiments & Sauces
    ('Ketchup', 'Condiments', 2.99, 'bottle'),
    ('Mustard', 'Condiments', 2.49, 'bottle'),
    ('Mayonnaise', 'Condiments', 4.99, 'jar'),
    ('Salad Dressing', 'Condiments', 3.99, 'bottle'),
    ('BBQ Sauce', 'Condiments', 2.99, 'bottle'),
    ('Soy Sauce', 'Condiments', 3.49, 'bottle'),
    ('Hot Sauce', 'Condiments', 3.99, 'bottle'),
    
    -- Baking
    ('Flour', 'Grains', 4.99, '5lb bag'),
    ('Sugar', 'Grains', 3.99, '4lb bag'),
    ('Brown Sugar', 'Grains', 2.99, '2lb bag'),
    ('Baking Soda', 'Condiments', 1.49, 'box'),
    ('Baking Powder', 'Condiments', 2.49, 'can'),
    ('Vanilla Extract', 'Condiments', 5.99, 'bottle'),
    
    -- Breakfast
    ('Oatmeal', 'Grains', 4.49, 'container'),
    ('Pancake Mix', 'Grains', 3.99, 'box'),
    ('Maple Syrup', 'Condiments', 7.99, 'bottle'),
    ('Jam', 'Condiments', 3.99, 'jar'),
    
    -- Miscellaneous
    ('Toilet Paper', 'Household', 12.99, '12-pack'),
    ('Paper Towels', 'Household', 8.99, '6-pack'),
    ('Dish Soap', 'Household', 3.49, 'bottle'),
    ('Laundry Detergent', 'Household', 11.99, 'bottle')
) AS p(name, category, base_price, unit)
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_prices pp
  WHERE pp.product_name = p.name AND pp.store_id = s.id
);
