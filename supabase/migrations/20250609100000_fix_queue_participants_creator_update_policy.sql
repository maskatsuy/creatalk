-- Add policy to allow creators to update participant status for their plans
CREATE POLICY "Creators can update participants for their plans" ON public.queue_participants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.call_products
            WHERE call_products.id = plan_id
            AND call_products.creator_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.call_products
            WHERE call_products.id = plan_id
            AND call_products.creator_id = auth.uid()
        )
    );

-- Also add policy for current_queue_calls to update status
ALTER TABLE public.current_queue_calls 
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Create function to update updated_at column for current_queue_calls
CREATE OR REPLACE FUNCTION public.update_current_queue_calls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on current_queue_calls
CREATE TRIGGER update_current_queue_calls_updated_at
    BEFORE UPDATE ON public.current_queue_calls
    FOR EACH ROW
    EXECUTE FUNCTION public.update_current_queue_calls_updated_at();