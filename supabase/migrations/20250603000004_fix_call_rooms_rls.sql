-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Creators can create rooms" ON public.call_rooms;
DROP POLICY IF EXISTS "Creators can view own rooms" ON public.call_rooms;
DROP POLICY IF EXISTS "Creators can update own rooms" ON public.call_rooms;
DROP POLICY IF EXISTS "Participants can view their rooms" ON public.call_rooms;

-- Enable RLS if not already enabled
ALTER TABLE public.call_rooms ENABLE ROW LEVEL SECURITY;

-- Policy: Creators can create rooms (fixed to check auth.uid() = creator_id)
CREATE POLICY "Creators can create rooms" ON public.call_rooms
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Policy: Creators can view their own rooms
CREATE POLICY "Creators can view own rooms" ON public.call_rooms
    FOR SELECT USING (auth.uid() = creator_id);

-- Policy: Creators can update their own rooms
CREATE POLICY "Creators can update own rooms" ON public.call_rooms
    FOR UPDATE USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- Policy: Participants can view rooms they're in
CREATE POLICY "Participants can view their rooms" ON public.call_rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.call_bookings
            WHERE call_bookings.id = call_rooms.booking_id
            AND call_bookings.user_id = auth.uid()
        )
    );