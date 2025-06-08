import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface Database {
  public: {
    Tables: {
      call_products: {
        Row: {
          id: string
          type: 'queue' | 'fixed'
          status: string
          slot_date: string | null
          end_time: string | null
          available_until: string | null
          title: string
          creator_id: string
        }
      }
    }
  }
}

serve(async (req) => {
  try {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const now = new Date()
    const today = now.toISOString().split('T')[0] // YYYY-MM-DD
    const currentDateTime = now.toISOString()

    console.log(`Starting product expiration check at ${currentDateTime}`)

    // 0. Check for active bookings to avoid expiring products with ongoing calls
    const { data: activeBookings } = await supabase
      .from('call_bookings')
      .select('product_id')
      .in('status', ['confirmed', 'in_progress'])

    const activeProductIds = activeBookings?.map(b => b.product_id) || []
    console.log(`Found ${activeProductIds.length} products with active bookings`)

    // 1. Expire queue-type products (past slot_date) - excluding active bookings
    let queueFilter = supabase
      .from('call_products')
      .update({ 
        status: 'expired',
        updated_at: currentDateTime
      })
      .eq('type', 'queue')
      .eq('status', 'active')
      .lt('slot_date', today)

    if (activeProductIds.length > 0) {
      queueFilter = queueFilter.not('id', 'in', `(${activeProductIds.join(',')})`)
    }

    const { data: expiredQueueProducts, error: queueError } = await queueFilter
      .select('id, title, creator_id, slot_date')

    if (queueError) {
      console.error('Error expiring queue products:', queueError)
    } else {
      console.log(`Expired ${expiredQueueProducts?.length || 0} queue products`)
      expiredQueueProducts?.forEach(product => {
        console.log(`- ${product.title} (${product.slot_date})`)
      })
    }

    // 2. Expire fixed-type products (past available_until) - excluding active bookings
    let fixedFilter = supabase
      .from('call_products')
      .update({ 
        status: 'expired',
        updated_at: currentDateTime
      })
      .eq('type', 'fixed')
      .eq('status', 'active')
      .lt('available_until', currentDateTime)

    if (activeProductIds.length > 0) {
      fixedFilter = fixedFilter.not('id', 'in', `(${activeProductIds.join(',')})`)
    }

    const { data: expiredFixedProducts, error: fixedError } = await fixedFilter
      .select('id, title, creator_id, available_until')

    if (fixedError) {
      console.error('Error expiring fixed products:', fixedError)
    } else {
      console.log(`Expired ${expiredFixedProducts?.length || 0} fixed products`)
      expiredFixedProducts?.forEach(product => {
        console.log(`- ${product.title} (${product.available_until})`)
      })
    }

    // 3. Optional: Expire queue products where end_time has passed TODAY - excluding active bookings
    const currentTime = now.toTimeString().substring(0, 8) // HH:MM:SS
    let todayFilter = supabase
      .from('call_products')
      .update({ 
        status: 'expired',
        updated_at: currentDateTime
      })
      .eq('type', 'queue')
      .eq('status', 'active')
      .eq('slot_date', today)
      .lt('end_time', currentTime)

    if (activeProductIds.length > 0) {
      todayFilter = todayFilter.not('id', 'in', `(${activeProductIds.join(',')})`)
    }

    const { data: expiredTodayProducts, error: todayError } = await todayFilter
      .select('id, title, creator_id, end_time')

    if (todayError) {
      console.error('Error expiring today products:', todayError)
    } else {
      console.log(`Expired ${expiredTodayProducts?.length || 0} products from today`)
      expiredTodayProducts?.forEach(product => {
        console.log(`- ${product.title} (ended at ${product.end_time})`)
      })
    }

    // 4. Summary
    const totalExpired = (expiredQueueProducts?.length || 0) + 
                        (expiredFixedProducts?.length || 0) + 
                        (expiredTodayProducts?.length || 0)

    const result = {
      success: true,
      timestamp: currentDateTime,
      expired_products: {
        queue_past_date: expiredQueueProducts?.length || 0,
        fixed_past_time: expiredFixedProducts?.length || 0,
        queue_past_end_time: expiredTodayProducts?.length || 0,
        total: totalExpired
      },
      details: {
        queue_products: expiredQueueProducts || [],
        fixed_products: expiredFixedProducts || [],
        today_products: expiredTodayProducts || []
      }
    }

    console.log('Product expiration completed:', result.expired_products)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in expire-products function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})