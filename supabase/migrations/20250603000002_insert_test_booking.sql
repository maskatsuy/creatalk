-- Insert test booking for Daily.co testing
INSERT INTO public.call_bookings (
    product_id,
    user_id,
    creator_id,
    payment_intent_id,
    status,
    amount
)
SELECT 
    cp.id as product_id,
    '464c3bc0-99bf-47a0-a012-07c576290af8' as user_id, -- Using creator as user for testing
    cp.creator_id,
    'test_payment_' || gen_random_uuid() as payment_intent_id,
    'confirmed' as status,
    cp.price as amount
FROM public.call_products cp
WHERE cp.creator_id = '464c3bc0-99bf-47a0-a012-07c576290af8'
AND cp.status = 'active'
LIMIT 1;