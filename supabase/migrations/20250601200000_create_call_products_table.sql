-- Create call_products table for managing creator's call offerings
CREATE TABLE public.call_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('queue', 'fixed')),
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price >= 0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    
    -- For queue type products
    slot_date DATE,
    start_time TIME,
    end_time TIME,
    max_participants INTEGER CHECK (max_participants > 0),
    remaining_slots INTEGER CHECK (remaining_slots >= 0),
    
    -- For fixed type products
    available_from TIMESTAMP WITH TIME ZONE,
    available_until TIMESTAMP WITH TIME ZONE,
    
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure queue products have required fields
    CONSTRAINT queue_products_have_slots CHECK (
        type != 'queue' OR (
            slot_date IS NOT NULL AND
            start_time IS NOT NULL AND
            end_time IS NOT NULL AND
            max_participants IS NOT NULL AND
            remaining_slots IS NOT NULL
        )
    ),
    
    -- Ensure fixed products have required fields
    CONSTRAINT fixed_products_have_availability CHECK (
        type != 'fixed' OR (
            available_from IS NOT NULL AND
            available_until IS NOT NULL
        )
    )
);

-- Create indexes for better query performance
CREATE INDEX idx_call_products_creator_id ON public.call_products(creator_id);
CREATE INDEX idx_call_products_type ON public.call_products(type);
CREATE INDEX idx_call_products_status ON public.call_products(status);
CREATE INDEX idx_call_products_slot_date ON public.call_products(slot_date);

-- Set up Row Level Security (RLS)
ALTER TABLE public.call_products ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active products
CREATE POLICY "Anyone can view active products" ON public.call_products
    FOR SELECT USING (status = 'active');

-- Policy: Creators can view all their own products
CREATE POLICY "Creators can view own products" ON public.call_products
    FOR SELECT USING (auth.uid() = creator_id);

-- Policy: Creators can create their own products
CREATE POLICY "Creators can create products" ON public.call_products
    FOR INSERT WITH CHECK (
        auth.uid() = creator_id AND
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role_id = 'creator'
        )
    );

-- Policy: Creators can update their own products
CREATE POLICY "Creators can update own products" ON public.call_products
    FOR UPDATE USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- Policy: Creators can delete their own products
CREATE POLICY "Creators can delete own products" ON public.call_products
    FOR DELETE USING (auth.uid() = creator_id);

-- Create updated_at trigger
CREATE TRIGGER update_call_products_updated_at
    BEFORE UPDATE ON public.call_products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();