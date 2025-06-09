import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClientWithCookies } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  console.log('[Stripe Webhook] POST request received');
  
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');
  
  console.log('[Stripe Webhook] Signature present:', !!signature);

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);

  console.log(`[Stripe Webhook] Received event: ${event.type}`);
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[Stripe Webhook] Processing checkout.session.completed');
        
        // メタデータから情報を取得
        const { userId, productId, creatorId, productType } = session.metadata || {};
        
        if (!userId || !productId || !creatorId) {
          console.error('Missing metadata in checkout session');
          break;
        }

        // 予約のステータスを確認済みに更新
        const { error: updateError } = await supabase
          .from('call_bookings')
          .update({ status: 'confirmed' })
          .eq('payment_intent_id', session.payment_intent as string);

        if (updateError) {
          console.error('Failed to update booking status:', updateError);
        }

        // 商品の残り枠を減らす（先着制の場合）
        if (productType === 'queue') {
          console.log(`[Stripe Webhook] Decrementing slots for product: ${productId}`);
          const { error: productError } = await supabase.rpc(
            'decrement_remaining_slots',
            { product_id: productId }
          );

          if (productError) {
            console.error('Failed to decrement slots:', productError);
          } else {
            console.log('[Stripe Webhook] Successfully decremented slots');
          }
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // 支払い失敗時の処理
        const { error: updateError } = await supabase
          .from('call_bookings')
          .update({ status: 'cancelled' })
          .eq('payment_intent_id', paymentIntent.id);

        if (updateError) {
          console.error('Failed to update booking status:', updateError);
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}