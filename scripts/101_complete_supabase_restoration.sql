-- Complete Supabase Database Restoration Script
-- This removes all household features and restores simple user-based RLS

-- ============================================
-- STEP 1: Drop all household-related policies
-- ============================================

-- Pantry items household policies
DROP POLICY IF EXISTS "pantry_items_select_household" ON pantry_items;
DROP POLICY IF EXISTS "pantry_items_insert_household" ON pantry_items;
DROP POLICY IF EXISTS "pantry_items_update_household" ON pantry_items;
DROP POLICY IF EXISTS "pantry_items_delete_household" ON pantry_items;

-- Receipts household policies
DROP POLICY IF EXISTS "receipts_select_household" ON receipts;
DROP POLICY IF EXISTS "receipts_insert_household" ON receipts;
DROP POLICY IF EXISTS "receipts_update_household" ON receipts;
DROP POLICY IF EXISTS "receipts_delete_household" ON receipts;

-- Recipes household policies
DROP POLICY IF EXISTS "recipes_select_household" ON recipes;
DROP POLICY IF EXISTS "recipes_insert_household" ON recipes;
DROP POLICY IF EXISTS "recipes_update_household" ON recipes;
DROP POLICY IF EXISTS "recipes_delete_household" ON recipes;

-- Shopping lists household policies
DROP POLICY IF EXISTS "shopping_lists_select_household" ON shopping_lists;
DROP POLICY IF EXISTS "shopping_lists_insert_household" ON shopping_lists;
DROP POLICY IF EXISTS "shopping_lists_update_household" ON shopping_lists;
DROP POLICY IF EXISTS "shopping_lists_delete_household" ON shopping_lists;

-- Shopping list items household policies
DROP POLICY IF EXISTS "shopping_list_items_select_household" ON shopping_list_items;
DROP POLICY IF EXISTS "shopping_list_items_insert_household" ON shopping_list_items;
DROP POLICY IF EXISTS "shopping_list_items_update_household" ON shopping_list_items;
DROP POLICY IF EXISTS "shopping_list_items_delete_household" ON shopping_list_items;

-- Spending analytics household policies
DROP POLICY IF EXISTS "spending_analytics_select_household" ON spending_analytics;
DROP POLICY IF EXISTS "spending_analytics_insert_household" ON spending_analytics;
DROP POLICY IF EXISTS "spending_analytics_update_household" ON spending_analytics;
DROP POLICY IF EXISTS "spending_analytics_delete_household" ON spending_analytics;

-- ============================================
-- STEP 2: Drop household tables
-- ============================================

DROP TABLE IF EXISTS household_invitations CASCADE;
DROP TABLE IF EXISTS household_members CASCADE;
DROP TABLE IF EXISTS households CASCADE;

-- ============================================
-- STEP 3: Remove household_id from profiles
-- ============================================

ALTER TABLE profiles DROP COLUMN IF EXISTS household_id CASCADE;

-- ============================================
-- STEP 4: Ensure clean user-based policies exist
-- ============================================

-- Pantry Items - Keep only simple user-based policies
DROP POLICY IF EXISTS "pantry_items_select" ON pantry_items;
DROP POLICY IF EXISTS "pantry_items_insert" ON pantry_items;
DROP POLICY IF EXISTS "pantry_items_update" ON pantry_items;
DROP POLICY IF EXISTS "pantry_items_delete" ON pantry_items;

CREATE POLICY "pantry_items_select"
  ON pantry_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "pantry_items_insert"
  ON pantry_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pantry_items_update"
  ON pantry_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "pantry_items_delete"
  ON pantry_items FOR DELETE
  USING (auth.uid() = user_id);

-- Receipts - Keep only simple user-based policies
DROP POLICY IF EXISTS "receipts_select" ON receipts;
DROP POLICY IF EXISTS "receipts_insert" ON receipts;
DROP POLICY IF EXISTS "receipts_update" ON receipts;
DROP POLICY IF EXISTS "receipts_delete" ON receipts;

CREATE POLICY "receipts_select"
  ON receipts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "receipts_insert"
  ON receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "receipts_update"
  ON receipts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "receipts_delete"
  ON receipts FOR DELETE
  USING (auth.uid() = user_id);

-- Recipes - Keep only simple user-based policies
DROP POLICY IF EXISTS "recipes_select" ON recipes;
DROP POLICY IF EXISTS "recipes_insert" ON recipes;
DROP POLICY IF EXISTS "recipes_update" ON recipes;
DROP POLICY IF EXISTS "recipes_delete" ON recipes;

CREATE POLICY "recipes_select"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "recipes_insert"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recipes_update"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "recipes_delete"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Shopping Lists - Keep only simple user-based policies
DROP POLICY IF EXISTS "shopping_lists_select" ON shopping_lists;
DROP POLICY IF EXISTS "shopping_lists_insert" ON shopping_lists;
DROP POLICY IF EXISTS "shopping_lists_update" ON shopping_lists;
DROP POLICY IF EXISTS "shopping_lists_delete" ON shopping_lists;

CREATE POLICY "shopping_lists_select"
  ON shopping_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "shopping_lists_insert"
  ON shopping_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "shopping_lists_update"
  ON shopping_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "shopping_lists_delete"
  ON shopping_lists FOR DELETE
  USING (auth.uid() = user_id);

-- Shopping List Items - Keep only simple user-based policies
DROP POLICY IF EXISTS "shopping_list_items_select" ON shopping_list_items;
DROP POLICY IF EXISTS "shopping_list_items_insert" ON shopping_list_items;
DROP POLICY IF EXISTS "shopping_list_items_update" ON shopping_list_items;
DROP POLICY IF EXISTS "shopping_list_items_delete" ON shopping_list_items;

CREATE POLICY "shopping_list_items_select"
  ON shopping_list_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "shopping_list_items_insert"
  ON shopping_list_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "shopping_list_items_update"
  ON shopping_list_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "shopping_list_items_delete"
  ON shopping_list_items FOR DELETE
  USING (auth.uid() = user_id);

-- Spending Analytics - Keep only simple user-based policies
DROP POLICY IF EXISTS "spending_analytics_select" ON spending_analytics;
DROP POLICY IF EXISTS "spending_analytics_insert" ON spending_analytics;
DROP POLICY IF EXISTS "spending_analytics_update" ON spending_analytics;
DROP POLICY IF EXISTS "spending_analytics_delete" ON spending_analytics;

CREATE POLICY "spending_analytics_select"
  ON spending_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "spending_analytics_insert"
  ON spending_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "spending_analytics_update"
  ON spending_analytics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "spending_analytics_delete"
  ON spending_analytics FOR DELETE
  USING (auth.uid() = user_id);

-- Receipt Items - Keep only simple user-based policies
DROP POLICY IF EXISTS "receipt_items_select_own" ON receipt_items;
DROP POLICY IF EXISTS "receipt_items_insert_own" ON receipt_items;
DROP POLICY IF EXISTS "receipt_items_update_own" ON receipt_items;
DROP POLICY IF EXISTS "receipt_items_delete_own" ON receipt_items;

CREATE POLICY "receipt_items_select_own"
  ON receipt_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "receipt_items_insert_own"
  ON receipt_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "receipt_items_update_own"
  ON receipt_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "receipt_items_delete_own"
  ON receipt_items FOR DELETE
  USING (auth.uid() = user_id);
