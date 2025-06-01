import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// サーバーアクション用のクライアント（service_roleキー）
export const supabaseServer = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
) 