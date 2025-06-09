-- Fix issue where multiple active calls can be created for the same plan
-- This combines cleanup and constraint creation in proper order

-- First, add columns if they don't exist
ALTER TABLE public.current_queue_calls
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE;

-- Clean up any existing duplicate active calls before creating constraint
WITH duplicates AS (
    SELECT id,
           plan_id,
           creator_id,
           started_at,
           ROW_NUMBER() OVER (
               PARTITION BY plan_id, creator_id 
               ORDER BY started_at DESC
           ) as rn
    FROM public.current_queue_calls
    WHERE status = 'active'
)
UPDATE public.current_queue_calls
SET status = 'ended',
    ended_at = COALESCE(ended_at, timezone('utc'::text, now())),
    updated_at = timezone('utc'::text, now())
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Create unique index to prevent multiple active calls for the same plan
-- This allows multiple ended calls but only one active call per plan
CREATE UNIQUE INDEX IF NOT EXISTS idx_current_queue_calls_one_active_per_plan 
ON public.current_queue_calls(plan_id, creator_id) 
WHERE status = 'active';

-- Create function to automatically set ended_at when status changes to 'ended'
CREATE OR REPLACE FUNCTION public.update_current_queue_calls_ended_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Set ended_at when status changes to 'ended'
    IF NEW.status = 'ended' AND OLD.status = 'active' THEN
        NEW.ended_at = timezone('utc'::text, now());
    END IF;
    
    -- Always update updated_at
    NEW.updated_at = timezone('utc'::text, now());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_current_queue_calls_timestamps ON public.current_queue_calls;

-- Create trigger for updating timestamps
CREATE TRIGGER update_current_queue_calls_timestamps
    BEFORE UPDATE ON public.current_queue_calls
    FOR EACH ROW
    EXECUTE FUNCTION public.update_current_queue_calls_ended_at();

-- Add comments
COMMENT ON COLUMN public.current_queue_calls.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN public.current_queue_calls.ended_at IS 'Timestamp when the call was ended';
COMMENT ON INDEX idx_current_queue_calls_one_active_per_plan IS 'Ensures only one active call per plan per creator at a time';