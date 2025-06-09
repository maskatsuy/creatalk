-- Add break_minutes column to call_products table for queue type plans
ALTER TABLE public.call_products
ADD COLUMN IF NOT EXISTS break_minutes INTEGER DEFAULT 0 CHECK (break_minutes >= 0);

-- Add comment
COMMENT ON COLUMN public.call_products.break_minutes IS 'Break time in minutes between calls for queue type plans';