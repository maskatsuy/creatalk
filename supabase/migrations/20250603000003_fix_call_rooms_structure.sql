-- Add missing columns to call_rooms table if they don't exist
DO $$ 
BEGIN
    -- Add booking_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'call_rooms' 
                   AND column_name = 'booking_id') THEN
        ALTER TABLE public.call_rooms
        ADD COLUMN booking_id UUID NOT NULL REFERENCES public.call_bookings(id) ON DELETE CASCADE;
        
        CREATE INDEX idx_call_rooms_booking_id ON public.call_rooms(booking_id);
    END IF;

    -- Add creator_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'call_rooms' 
                   AND column_name = 'creator_id') THEN
        ALTER TABLE public.call_rooms
        ADD COLUMN creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
        
        CREATE INDEX idx_call_rooms_creator_id ON public.call_rooms(creator_id);
    END IF;

    -- Add other missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'call_rooms' 
                   AND column_name = 'max_participants') THEN
        ALTER TABLE public.call_rooms
        ADD COLUMN max_participants INTEGER NOT NULL DEFAULT 2;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'call_rooms' 
                   AND column_name = 'enable_recording') THEN
        ALTER TABLE public.call_rooms
        ADD COLUMN enable_recording BOOLEAN NOT NULL DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'call_rooms' 
                   AND column_name = 'expires_at') THEN
        ALTER TABLE public.call_rooms
        ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + interval '1 hour');
    END IF;
END $$;