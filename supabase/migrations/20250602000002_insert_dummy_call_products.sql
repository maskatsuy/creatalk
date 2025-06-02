-- Insert dummy call products for testing

-- First, let's get a creator user ID (assuming you have at least one user with creator role)
WITH creator AS (
  SELECT user_id FROM public.user_roles WHERE role_id = 'creator' LIMIT 1
)

-- Insert queue type products
INSERT INTO public.call_products (
  creator_id,
  type,
  title,
  description,
  price,
  duration_minutes,
  slot_date,
  start_time,
  end_time,
  max_participants,
  remaining_slots,
  status
) 
SELECT 
  creator.user_id,
  'queue',
  'プログラミング相談会',
  'Next.jsやReactの開発について何でも相談できます',
  3000,
  30,
  CURRENT_DATE + interval '1 day',
  '14:00:00'::time,
  '16:00:00'::time,
  4,
  3,
  'active'
FROM creator
WHERE EXISTS (SELECT 1 FROM creator)

UNION ALL

SELECT 
  creator.user_id,
  'queue',
  'キャリア相談セッション',
  'エンジニアのキャリアについて相談できます',
  5000,
  45,
  CURRENT_DATE + interval '2 days',
  '19:00:00'::time,
  '21:00:00'::time,
  3,
  1,
  'active'
FROM creator
WHERE EXISTS (SELECT 1 FROM creator)

UNION ALL

-- Insert fixed type products
SELECT 
  creator.user_id,
  'fixed',
  '1on1メンタリング',
  '個別でじっくり技術相談ができます',
  8000,
  60,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'active'
FROM creator
WHERE EXISTS (SELECT 1 FROM creator);

-- Update fixed products with availability dates
UPDATE public.call_products
SET 
  available_from = NOW(),
  available_until = NOW() + interval '30 days'
WHERE type = 'fixed';