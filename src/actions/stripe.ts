'use server';

import { createServerClientWithCookies } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function createCheckoutSession(params: {
  productId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== params.userId) {
    return { error: 'ログインが必要です' };
  }

  console.log('Stripe checkout params:', params);
  
  // First try without is_active filter to debug
  const { data: productCheck } = await supabase
    .from('call_products')
    .select('*')
    .eq('id', params.productId)
    .single();
    
  console.log('Product check (without is_active):', productCheck);

  const { data: product, error: productError } = await supabase
    .from('call_products')
    .select('*')
    .eq('id', params.productId)
    .single();

  if (productError || !product) {
    console.error('Product fetch error:', productError);
    console.error('ProductId:', params.productId);
    return { error: '商品が見つかりません' };
  }

  // Get creator info separately
  const { data: creatorInfo } = await supabase
    .from('creator_applications')
    .select('display_name')
    .eq('user_id', product.creator_id)
    .eq('status', 'approved')
    .single();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: product.title,
              description: product.type === 'queue' 
                ? `${creatorInfo?.display_name || 'クリエイター'}との通話（${product.duration_minutes}分・先着順）`
                : `${creatorInfo?.display_name || 'クリエイター'}との通話（${product.duration_minutes}分）`,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        userId: user.id,
        productId: params.productId,
        creatorId: product.creator_id,
        productType: product.type,
      },
    });

    if (!session.url || !session.id) {
      return { error: '決済セッションの作成に失敗しました' };
    }

    return { sessionId: session.id };
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    return { error: '決済処理でエラーが発生しました' };
  }
}

export async function verifyPaymentSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return { success: false, error: '決済が完了していません' };
    }

    return { 
      success: true, 
      metadata: session.metadata,
      paymentIntent: session.payment_intent as string,
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return { success: false, error: '決済の確認に失敗しました' };
  }
}