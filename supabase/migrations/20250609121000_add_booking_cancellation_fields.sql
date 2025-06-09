-- Add cancellation-related columns to call_bookings
ALTER TABLE public.call_bookings
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS refund_status TEXT CHECK (refund_status IN ('pending', 'processing', 'completed', 'failed', 'not_applicable'));

-- Add comment
COMMENT ON COLUMN public.call_bookings.cancelled_at IS 'Timestamp when the booking was cancelled';
COMMENT ON COLUMN public.call_bookings.cancellation_reason IS 'Reason for cancellation';
COMMENT ON COLUMN public.call_bookings.refund_status IS 'Status of refund processing if applicable';

-- Create index for finding bookings that need refund processing
CREATE INDEX idx_call_bookings_refund_status ON public.call_bookings(refund_status) 
WHERE refund_status IS NOT NULL;