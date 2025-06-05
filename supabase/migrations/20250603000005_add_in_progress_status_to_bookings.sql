-- Add 'in_progress' to the status check constraint for call_bookings
ALTER TABLE public.call_bookings 
DROP CONSTRAINT call_bookings_status_check;

ALTER TABLE public.call_bookings 
ADD CONSTRAINT call_bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'in_progress', 'cancelled', 'completed'));

-- Also add room_id column to link to call_rooms table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'call_bookings' 
                   AND column_name = 'room_id') THEN
        ALTER TABLE public.call_bookings
        ADD COLUMN room_id UUID REFERENCES public.call_rooms(id) ON DELETE SET NULL;
        
        CREATE INDEX idx_call_bookings_room_id ON public.call_bookings(room_id);
    END IF;
END $$;

-- Update the policy to allow creators to update their bookings
DROP POLICY IF EXISTS "Creators can update their bookings" ON public.call_bookings;

CREATE POLICY "Creators can update their bookings" ON public.call_bookings
    FOR UPDATE USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);