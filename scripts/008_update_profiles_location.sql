-- Add location and driving preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_city TEXT,
ADD COLUMN IF NOT EXISTS location_state TEXT,
ADD COLUMN IF NOT EXISTS location_zip_code TEXT,
ADD COLUMN IF NOT EXISTS driving_preference TEXT DEFAULT 'flexible' CHECK (driving_preference IN ('no_drive', 'flexible')),
ADD COLUMN IF NOT EXISTS max_driving_distance_miles INTEGER DEFAULT 10;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.driving_preference IS 'User preference: no_drive (can''t drive) or flexible (don''t mind driving around)';
COMMENT ON COLUMN public.profiles.max_driving_distance_miles IS 'Maximum distance user willing to drive (only applies when driving_preference is flexible)';
