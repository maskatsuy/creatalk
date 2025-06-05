-- Add room_id reference to call_bookings if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'call_bookings' 
                   AND column_name = 'room_id') THEN
        ALTER TABLE public.call_bookings
        ADD COLUMN room_id UUID REFERENCES public.call_rooms(id) ON DELETE SET NULL;
    END IF;
END $$;