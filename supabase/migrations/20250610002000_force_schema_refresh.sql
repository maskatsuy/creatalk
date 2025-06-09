-- Force schema refresh by creating a dummy function
CREATE OR REPLACE FUNCTION public.force_schema_refresh_20250610()
RETURNS void
LANGUAGE sql
AS $$
  SELECT 1;
$$;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Drop the dummy function
DROP FUNCTION IF EXISTS public.force_schema_refresh_20250610();

-- Verify break_minutes column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'call_products' 
    AND column_name = 'break_minutes'
  ) THEN
    RAISE EXCEPTION 'break_minutes column does not exist in call_products table';
  END IF;
END $$;