-- Create call_bookings table for storing payment and booking information
CREATE TABLE public.call_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.call_products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_intent_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    amount INTEGER NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_call_bookings_product_id ON public.call_bookings(product_id);
CREATE INDEX idx_call_bookings_user_id ON public.call_bookings(user_id);
CREATE INDEX idx_call_bookings_creator_id ON public.call_bookings(creator_id);
CREATE INDEX idx_call_bookings_payment_intent_id ON public.call_bookings(payment_intent_id);
CREATE INDEX idx_call_bookings_status ON public.call_bookings(status);

-- Set up Row Level Security (RLS)
ALTER TABLE public.call_bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON public.call_bookings
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Creators can view bookings for their products
CREATE POLICY "Creators can view their bookings" ON public.call_bookings
    FOR SELECT USING (auth.uid() = creator_id);

-- Policy: Authenticated users can create bookings (via server actions)
CREATE POLICY "Users can create bookings" ON public.call_bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own bookings (for cancellation)
CREATE POLICY "Users can update own bookings" ON public.call_bookings
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_call_bookings_updated_at
    BEFORE UPDATE ON public.call_bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();