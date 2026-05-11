-- Create stores table for grocery store locations and information
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  chain TEXT NOT NULL, -- e.g., "Walmart", "Target", "Kroger"
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product_prices table to track prices at different stores
CREATE TABLE IF NOT EXISTS public.product_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  unit TEXT, -- e.g., "lb", "oz", "each"
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stores_chain ON public.stores(chain);
CREATE INDEX IF NOT EXISTS idx_stores_city ON public.stores(city);
CREATE INDEX IF NOT EXISTS idx_product_prices_store ON public.product_prices(store_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_product ON public.product_prices(product_name);
CREATE INDEX IF NOT EXISTS idx_product_prices_category ON public.product_prices(category);

-- Enable Row Level Security
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;

-- Stores are public - anyone can read
CREATE POLICY "Stores are viewable by everyone"
  ON public.stores FOR SELECT
  USING (true);

-- Only authenticated users can add stores
CREATE POLICY "Authenticated users can insert stores"
  ON public.stores FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Product prices are viewable by everyone
CREATE POLICY "Product prices are viewable by everyone"
  ON public.product_prices FOR SELECT
  USING (true);

-- Users can add their own price observations
CREATE POLICY "Users can insert product prices"
  ON public.product_prices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own price observations
CREATE POLICY "Users can update own product prices"
  ON public.product_prices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
