-- ==========================================
-- Fix Household RLS Infinite Recursion
-- ==========================================
-- This script removes all household-related features and restores
-- simple user-based RLS policies that work correctly.

-- Step 1: Drop all household-related RLS policies
DROP POLICY IF EXISTS "pantry_items_household_select" ON pantry_items;
DROP POLICY IF EXISTS "pantry_items_household_insert" ON pantry_items;
DROP POLICY IF EXISTS "pantry_items_household_update" ON pantry_items;
DROP POLICY IF EXISTS "pantry_items_household_delete" ON pantry_items;

DROP POLICY IF EXISTS "receipts_household_select" ON receipts;
DROP POLICY IF EXISTS "receipts_household_insert" ON receipts;
DROP POLICY IF EXISTS "receipts_household_update" ON receipts;
DROP POLICY IF EXISTS "receipts_household_delete" ON receipts;

DROP POLICY IF EXISTS "receipt_items_household_select" ON receipt_items;
DROP POLICY IF EXISTS "receipt_items_household_insert" ON receipt_items;
DROP POLICY IF EXISTS "receipt_items_household_update" ON receipt_items;
DROP POLICY IF EXISTS "receipt_items_household_delete" ON receipt_items;

DROP POLICY IF EXISTS "recipes_household_select" ON recipes;
DROP POLICY IF EXISTS "recipes_household_insert" ON recipes;
DROP POLICY IF EXISTS "recipes_household_update" ON recipes;
DROP POLICY IF EXISTS "recipes_household_delete" ON recipes;

DROP POLICY IF EXISTS "shopping_list_items_household_select" ON shopping_list_items;
DROP POLICY IF EXISTS "shopping_list_items_household_insert" ON shopping_list_items;
DROP POLICY IF EXISTS "shopping_list_items_household_update" ON shopping_list_items;
DROP POLICY IF EXISTS "shopping_list_items_household_delete" ON shopping_list_items;

DROP POLICY IF EXISTS "spending_analytics_household_select" ON spending_analytics;
DROP POLICY IF EXISTS "spending_analytics_household_insert" ON spending_analytics;
DROP POLICY IF EXISTS "spending_analytics_household_update" ON spending_analytics;
DROP POLICY IF EXISTS "spending_analytics_household_delete" ON spending_analytics;

DROP POLICY IF EXISTS "stores_household_select" ON stores;
DROP POLICY IF EXISTS "stores_household_insert" ON stores;

DROP POLICY IF EXISTS "product_prices_household_select" ON product_prices;
DROP POLICY IF EXISTS "product_prices_household_insert" ON product_prices;

-- Step 2: Drop household tables
DROP TABLE IF EXISTS household_invitations CASCADE;
DROP TABLE IF EXISTS household_members CASCADE;
DROP TABLE IF EXISTS households CASCADE;

-- Step 3: Remove household_id column from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS household_id CASCADE;

-- Step 4: Recreate simple RLS policies for pantry_items
CREATE POLICY "Users can view their own pantry items"
  ON pantry_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pantry items"
  ON pantry_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pantry items"
  ON pantry_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pantry items"
  ON pantry_items FOR DELETE
  USING (auth.uid() = user_id);

-- Step 5: Recreate simple RLS policies for receipts
CREATE POLICY "Users can view their own receipts"
  ON receipts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receipts"
  ON receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receipts"
  ON receipts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receipts"
  ON receipts FOR DELETE
  USING (auth.uid() = user_id);

-- Step 6: Recreate simple RLS policies for receipt_items
CREATE POLICY "Users can view their own receipt items"
  ON receipt_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE receipts.id = receipt_items.receipt_id
      AND receipts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own receipt items"
  ON receipt_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE receipts.id = receipt_items.receipt_id
      AND receipts.user_id = auth.uid()
    )
  );

-- Step 7: Recreate simple RLS policies for recipes
CREATE POLICY "Users can view their own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Step 8: Recreate simple RLS policies for shopping_list_items
CREATE POLICY "Users can view their own shopping items"
  ON shopping_list_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopping items"
  ON shopping_list_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping items"
  ON shopping_list_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping items"
  ON shopping_list_items FOR DELETE
  USING (auth.uid() = user_id);

-- Step 9: Recreate simple RLS policies for spending_analytics
CREATE POLICY "Users can view their own spending analytics"
  ON spending_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spending analytics"
  ON spending_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spending analytics"
  ON spending_analytics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 10: Recreate simple RLS policies for stores
CREATE POLICY "Users can view all stores"
  ON stores FOR SELECT
  USING (true);

CREATE POLICY "Users can insert stores"
  ON stores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Step 11: Recreate simple RLS policies for product_prices
CREATE POLICY "Users can view all product prices"
  ON product_prices FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own product prices"
  ON product_prices FOR INSERT
  WITH CHECK (auth.uid() = user_id);
