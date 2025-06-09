-- Add new timestamp columns for queue type products
ALTER TABLE public.call_products
ADD COLUMN start_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN end_at TIMESTAMP WITH TIME ZONE;

-- Migrate existing data (combine slot_date with start_time/end_time)
UPDATE public.call_products
SET 
  start_at = CASE 
    WHEN slot_date IS NOT NULL AND start_time IS NOT NULL 
    THEN (slot_date || 'T' || start_time || '+09:00')::TIMESTAMP WITH TIME ZONE
    ELSE NULL
  END,
  end_at = CASE 
    WHEN slot_date IS NOT NULL AND end_time IS NOT NULL 
    THEN 
      CASE 
        -- If end_time < start_time, assume next day
        WHEN end_time < start_time 
        THEN ((slot_date::DATE + INTERVAL '1 day')::DATE || 'T' || end_time || '+09:00')::TIMESTAMP WITH TIME ZONE
        ELSE (slot_date || 'T' || end_time || '+09:00')::TIMESTAMP WITH TIME ZONE
      END
    ELSE NULL
  END
WHERE type = 'queue';

-- Update check constraint to use new columns
ALTER TABLE public.call_products
DROP CONSTRAINT IF EXISTS queue_products_have_slots;

ALTER TABLE public.call_products
ADD CONSTRAINT queue_products_have_timestamps CHECK (
  type != 'queue' OR (
    start_at IS NOT NULL AND
    end_at IS NOT NULL AND
    max_participants IS NOT NULL AND
    remaining_slots IS NOT NULL
  )
);

-- Create indexes for better query performance
CREATE INDEX idx_call_products_start_at ON public.call_products(start_at);
CREATE INDEX idx_call_products_end_at ON public.call_products(end_at);

-- Update RLS policies to use new columns (optional, but recommended)
-- For example, active products could be those where now() is between start_at - interval '10 minutes' and end_at

-- Note: We keep the old columns for backward compatibility during transition
-- In a future migration, we can drop slot_date, start_time, end_time columns