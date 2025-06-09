-- Update call_rooms table to work with call_bookings instead of reservations

-- First, drop the old foreign key constraint if it exists
ALTER TABLE public.call_rooms 
DROP CONSTRAINT IF EXISTS call_rooms_reservation_id_fkey;

-- Make reservation_id nullable since we're transitioning away from it
ALTER TABLE public.call_rooms 
ALTER COLUMN reservation_id DROP NOT NULL;

-- Ensure booking_id column exists and has proper constraints
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'call_rooms' 
                   AND column_name = 'booking_id') THEN
        ALTER TABLE public.call_rooms
        ADD COLUMN booking_id UUID REFERENCES public.call_bookings(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ensure creator_id column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'call_rooms' 
                   AND column_name = 'creator_id') THEN
        ALTER TABLE public.call_rooms
        ADD COLUMN creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ensure status column exists with default value
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'call_rooms' 
                   AND column_name = 'status') THEN
        ALTER TABLE public.call_rooms
        ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'expired'));
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_call_rooms_booking_id ON public.call_rooms(booking_id);
CREATE INDEX IF NOT EXISTS idx_call_rooms_creator_id ON public.call_rooms(creator_id);
CREATE INDEX IF NOT EXISTS idx_call_rooms_status ON public.call_rooms(status);

-- Add RLS policies for the new structure
-- Policy: Creators can view their own call rooms
CREATE POLICY "Creators can view their call rooms" ON public.call_rooms
    FOR SELECT USING (auth.uid() = creator_id);

-- Policy: System can insert call rooms (via server actions)
CREATE POLICY "System can create call rooms" ON public.call_rooms
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Policy: Creators can update their own call rooms
CREATE POLICY "Creators can update their call rooms" ON public.call_rooms
    FOR UPDATE USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- Add comment
COMMENT ON COLUMN public.call_rooms.booking_id IS 'Reference to call_bookings table (replacing reservation_id)';
COMMENT ON COLUMN public.call_rooms.reservation_id IS 'Legacy column - to be removed in future migration';