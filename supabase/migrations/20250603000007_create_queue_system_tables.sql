-- Create creator status tracking table
CREATE TABLE public.creator_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.call_products(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('offline', 'waiting', 'in_call', 'break')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(creator_id, plan_id)
);

-- Create queue participants table
CREATE TABLE public.queue_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES public.call_products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('waiting', 'in_call', 'completed', 'cancelled')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    call_started_at TIMESTAMP WITH TIME ZONE,
    call_ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create current queue calls table
CREATE TABLE public.current_queue_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES public.call_products(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.queue_participants(id) ON DELETE CASCADE,
    daily_room_name TEXT NOT NULL,
    daily_room_url TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'ended')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_creator_status_creator_plan ON public.creator_status(creator_id, plan_id);
CREATE INDEX idx_queue_participants_plan_status ON public.queue_participants(plan_id, status);
CREATE INDEX idx_queue_participants_position ON public.queue_participants(plan_id, position);
CREATE INDEX idx_current_queue_calls_plan ON public.current_queue_calls(plan_id);
CREATE INDEX idx_current_queue_calls_status ON public.current_queue_calls(status);

-- Set up Row Level Security (RLS)
ALTER TABLE public.creator_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_queue_calls ENABLE ROW LEVEL SECURITY;

-- Policies for creator_status
CREATE POLICY "Creators can view own status" ON public.creator_status
    FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Creators can update own status" ON public.creator_status
    FOR ALL USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- Policies for queue_participants
CREATE POLICY "Creators can view participants for their plans" ON public.queue_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.call_products
            WHERE call_products.id = plan_id
            AND call_products.creator_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own participation" ON public.queue_participants
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own participation" ON public.queue_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation" ON public.queue_participants
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for current_queue_calls
CREATE POLICY "Creators can manage their queue calls" ON public.current_queue_calls
    FOR ALL USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Participants can view their calls" ON public.current_queue_calls
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.queue_participants
            WHERE queue_participants.id = participant_id
            AND queue_participants.user_id = auth.uid()
        )
    );

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_queue_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_queue_participants_updated_at
    BEFORE UPDATE ON public.queue_participants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_queue_participants_updated_at();