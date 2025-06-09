-- Add started_at and ended_at columns to call_bookings table
ALTER TABLE public.call_bookings
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_call_bookings_started_at ON public.call_bookings(started_at);
CREATE INDEX IF NOT EXISTS idx_call_bookings_ended_at ON public.call_bookings(ended_at);

-- Add comment
COMMENT ON COLUMN public.call_bookings.started_at IS 'Timestamp when the call actually started';
COMMENT ON COLUMN public.call_bookings.ended_at IS 'Timestamp when the call actually ended';