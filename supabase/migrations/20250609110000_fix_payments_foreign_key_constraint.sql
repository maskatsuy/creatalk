-- Drop the existing foreign key constraint
ALTER TABLE public.payments 
DROP CONSTRAINT IF EXISTS payments_product_id_fkey;

-- Add the foreign key constraint with ON DELETE SET NULL
-- This allows products to be deleted while preserving payment history
ALTER TABLE public.payments 
ADD CONSTRAINT payments_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.call_products(id) 
ON DELETE SET NULL;

-- Make product_id nullable since it can now be NULL after product deletion
ALTER TABLE public.payments 
ALTER COLUMN product_id DROP NOT NULL;

-- Add a comment to explain the change
COMMENT ON COLUMN public.payments.product_id IS 'Reference to call_products. Can be NULL if the product has been deleted.';