-- Add status and ended_at columns to call_rooms table
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'call_rooms' 
                   AND column_name = 'status') THEN
        ALTER TABLE public.call_rooms
        ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'expired'));
    END IF;

    -- Add ended_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'call_rooms' 
                   AND column_name = 'ended_at') THEN
        ALTER TABLE public.call_rooms
        ADD COLUMN ended_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create index for status
CREATE INDEX IF NOT EXISTS idx_call_rooms_status ON public.call_rooms(status);