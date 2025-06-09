import React from 'react';
import CallProductFeedLayout from './components/CallProductFeedLayout';
import type { Product } from './components/CallProductCard'; // Product型をインポート
import { formatDateTime } from '@/lib/utils'; // formatDateTime をインポート
import { createServerClientWithCookies } from '@/lib/supabase-server';
import { cookies } from 'next/headers';


// CallFeedFeature のエントリーポイント (サーバーコンポーネント)
export default async function CallFeedFeature() {
  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);
  
  // 現在のユーザーを取得
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <CallProductFeedLayout products={[]} />;
  }
  
  // フォローしているクリエイターを取得
  const { data: follows, error: followError } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id);
    
  if (followError) {
    console.error('Error fetching follows:', followError);
  }
  
  const followedCreatorIds = follows?.map(f => f.following_id) || [];
  
  console.log('User:', user.id);
  console.log('Followed creators:', followedCreatorIds);
  
  // フォローしているクリエイターの商品データを取得
  let dbProducts = null;
  let error = null;
  
  if (followedCreatorIds.length > 0) {
    const result = await supabase
      .from('call_products')
      .select(`
        id,
        creator_id,
        type,
        title,
        description,
        price,
        duration_minutes,
        status,
        created_at,
        slot_date,
        start_time,
        end_time,
        start_at,
        end_at,
        max_participants,
        remaining_slots,
        available_from,
        available_until
      `)
      .in('creator_id', followedCreatorIds)
      .eq('status', 'active')
      .neq('creator_id', user.id) // 自分の商品を除外
      .order('created_at', { ascending: false });
    
    dbProducts = result.data;
    error = result.error;
    
    console.log('Products from followed creators:', dbProducts?.length || 0);
    if (dbProducts) {
      dbProducts.forEach(p => {
        console.log(`Product: ${p.id}, type: ${p.type}, slot_date: ${p.slot_date}, start_time: ${p.start_time}, end_time: ${p.end_time}`);
      });
    }
  }

  if (error) {
    console.error('Error fetching products:', error);
  }

  // データベースから取得したデータをProduct型に変換
  let productsData: Product[] = [];
  
  // フォローしているクリエイターがいない場合の処理
  if (followedCreatorIds.length === 0) {
    console.log('No followed creators found');
    // 全ての商品を表示するか、空の配列を返すか選択できます
    // ここでは全ての商品を表示することにします
    const allProductsResult = await supabase
      .from('call_products')
      .select(`
        id,
        creator_id,
        type,
        title,
        description,
        price,
        duration_minutes,
        status,
        created_at,
        slot_date,
        start_time,
        end_time,
        start_at,
        end_at,
        max_participants,
        remaining_slots,
        available_from,
        available_until
      `)
      .eq('status', 'active')
      .neq('creator_id', user.id) // 自分の商品を除外
      .order('created_at', { ascending: false })
      .limit(20); // 最新20件に制限
    
    dbProducts = allProductsResult.data;
    error = allProductsResult.error;
  }
  
  if (dbProducts && dbProducts.length > 0) {
    // 現在の日時を取得
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentTime = now.toTimeString().substring(0, 8); // HH:MM:SS format
    
    console.log('Current date/time:', { today, currentTime });
    
    // 日付・時間でフィルタリング（プロフィールページと同じロジック）
    const availableProducts = dbProducts.filter(product => {
      // デバッグのため、一時的にすべての商品を表示
      console.log(`Checking product ${product.id}:`, {
        type: product.type,
        slot_date: product.slot_date,
        start_time: product.start_time,
        end_time: product.end_time,
        start_at: product.start_at,
        end_at: product.end_at,
        available_until: product.available_until,
        today,
        currentTime
      });
      
      if (product.type === 'queue') {
        // Check new timestamp fields first
        if (product.end_at) {
          const endAt = new Date(product.end_at);
          const isAvailable = endAt > now;
          
          if (!isAvailable) {
            console.log(`Product ${product.id} filtered out - queue type, past end_at`);
          }
          return isAvailable;
        }
        // Fallback to legacy fields
        else if (product.slot_date && product.end_time) {
          // For queue type: check if slot_date is today or future, and if today, end_time hasn't passed
          const isAvailable = product.slot_date > today || 
                            (product.slot_date === today && product.end_time > currentTime);
          
          if (!isAvailable) {
            console.log(`Product ${product.id} filtered out - queue type, past date/time`);
          }
          return isAvailable;
        }
      } else if (product.type === 'fixed' && product.available_until) {
        // For fixed type: check if available_until is in the future
        const isAvailable = new Date(product.available_until) > now;
        
        if (!isAvailable) {
          console.log(`Product ${product.id} filtered out - fixed type, past available_until`);
        }
        return isAvailable;
      }
      
      // slot_date や available_until が設定されていない場合も表示する
      console.log(`Product ${product.id} shown by default (no date restrictions)`);
      return true;
    });
    
    console.log('Available products after date/time filter:', availableProducts.length);

    // クリエイター情報を別途取得
    const creatorIds = [...new Set(availableProducts.map(p => p.creator_id))];
    const { data: creators } = await supabase
      .from('profiles')
      .select('id, display_name, email, avatar_url')
      .in('id', creatorIds);

    const creatorMap = new Map(creators?.map(c => [c.id, c]) || []);

    productsData = availableProducts.map((product, index) => {
      const creator = creatorMap.get(product.creator_id);
      return {
        id: product.id,
        creatorId: product.creator_id,
        creatorName: creator?.display_name || creator?.email || 'クリエイター',
        avatar: creator?.avatar_url || `https://picsum.photos/150/150?random=${index}`,
        productTitle: product.title,
        productImage: `https://picsum.photos/400/500?random=${10 + index}`,
        dateTime: product.start_at || (product.slot_date ? `${product.slot_date}T${product.start_time}` : new Date().toISOString()),
        slotDuration: product.duration_minutes,
        type: product.type === 'queue' ? 'queue' : 'slot',
        totalSlots: product.max_participants || 10,
        remainingSlots: product.remaining_slots || 5,
        price: product.price,
        isLive: false // 仮の値
      };
    });
  } else {
    // データベースにデータがない場合は空の配列を返す
    productsData = [];
  }

  // 日時でソートし、表示用にフォーマット
  const processedProducts = productsData
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .map(product => ({
      ...product,
      dateTime: formatDateTime(product.dateTime), // 表示用にフォーマット
    }));

  // フォローしているクリエイターがいるかどうかを判定
  const hasFollowedCreators = followedCreatorIds.length > 0;
  
  return <CallProductFeedLayout products={processedProducts} hasFollowedCreators={hasFollowedCreators} />;
} 