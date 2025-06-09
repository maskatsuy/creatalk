-- Add cancelled status to call_products
ALTER TABLE public.call_products 
DROP CONSTRAINT IF EXISTS call_products_status_check;

ALTER TABLE public.call_products 
ADD CONSTRAINT call_products_status_check 
CHECK (status IN ('active', 'inactive', 'cancelled', 'completed'));

-- Add cancellation-related columns
ALTER TABLE public.call_products
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add comment
COMMENT ON COLUMN public.call_products.cancelled_at IS 'Timestamp when the product was cancelled';
COMMENT ON COLUMN public.call_products.cancellation_reason IS 'Reason for cancellation (e.g., creator illness, emergency, etc.)';