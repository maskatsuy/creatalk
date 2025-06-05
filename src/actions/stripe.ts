'use server';

import { createServerClientWithCookies } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { redirect } from 'next/navigation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function createCheckoutSession(productId: string, creatorId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('ログインが必要です');
  }

  // デバッグ用ログ
  console.log('Searching for product:', { productId, creatorId });

  const { data: product, error: productError } = await supabase
    .from('call_products')
    .select('*')
    .eq('id', productId)
    .eq('creator_id', creatorId)
    .single();

  if (productError) {
    console.error('Product fetch error:', productError);
    throw new Error('商品の取得でエラーが発生しました');
  }

  if (!product) {
    console.error('Product not found with:', { productId, creatorId });
    throw new Error('商品が見つかりません');
  }

  if (product.status !== 'active') {
    throw new Error('この商品は現在購入できません');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `クリエイターとのビデオ通話`,
              description: product.type === 'queue' 
                ? `時間帯: ${product.slot_date} ${product.start_time}-${product.end_time}`
                : `日時: ${product.slot_date} ${product.start_time}`,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/call/waiting-room?session_id={CHECKOUT_SESSION_ID}&product_id=${productId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
      metadata: {
        userId: user.id,
        productId: productId,
        creatorId: creatorId,
        productType: product.type,
      },
    });

    if (!session.url) {
      throw new Error('決済セッションの作成に失敗しました');
    }

    return redirect(session.url);
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    throw new Error('決済処理でエラーが発生しました');
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