import React from 'react';
import CallProductFeedLayout from './components/CallProductFeedLayout';
import type { Product } from './components/CallProductCard'; // Product型をインポート
import { formatDateTime } from '@/lib/utils'; // formatDateTime をインポート
import { createServerClient } from '@/lib/supabase/server';

// ダミーデータをここに移動 (src/app/page.tsx から)
const followedCreators: Product[] = [
  {
    id: "1",
    creatorId: "creator-1",
    creatorName: "白猫ちゃん🐱",
    avatar: "https://picsum.photos/150/150?random=2",
    productTitle: "ゲーム配信中の雑談タイム✨",
    productImage: "https://picsum.photos/400/500?random=12",
    dateTime: "2025-06-01T20:30:00",
    slotDuration: 3,
    type: "slot",
    totalSlots: 15,
    remainingSlots: 2,
    price: 3500,
    isLive: true
  },
  {
    id: "2",
    creatorId: "creator-2",
    creatorName: "みゆきち♡",
    avatar: "https://picsum.photos/150/150?random=1",
    productTitle: "深夜のまったりおしゃべり💕",
    productImage: "https://picsum.photos/400/500?random=11",
    dateTime: "2025-06-01T21:00:00",
    slotDuration: 5,
    type: "queue",
    totalSlots: 20,
    remainingSlots: 8,
    price: 6000,
    isLive: false
  },
  {
    id: "3",
    creatorId: "creator-3",
    creatorName: "ジョン・スミス",
    avatar: "https://picsum.photos/150/150?random=3",
    productTitle: "英会話レッスン初級編",
    productImage: "https://picsum.photos/400/500?random=13",
    dateTime: "2025-06-01T10:00:00",
    slotDuration: 25,
    type: "slot",
    totalSlots: 5,
    remainingSlots: 3,
    price: 4000,
    isLive: false
  },
  {
    id: "4",
    creatorId: "creator-4",
    creatorName: "Tech Guru 先生",
    avatar: "https://picsum.photos/150/150?random=4",
    productTitle: "プログラミング相談室 (Python)",
    productImage: "https://picsum.photos/400/500?random=14",
    dateTime: "2025-06-02T14:00:00",
    slotDuration: 30,
    type: "queue",
    totalSlots: 10,
    remainingSlots: 10,
    price: 5000,
    isLive: true
  },
  {
    id: "5",
    creatorId: "creator-5",
    creatorName: "美麗イラストレーター🎨",
    avatar: "https://picsum.photos/150/150?random=5",
    productTitle: "あなたのアイコン描きます！",
    productImage: "https://picsum.photos/400/500?random=15",
    dateTime: "2025-06-02T18:30:00",
    slotDuration: 60,
    type: "slot",
    totalSlots: 3,
    remainingSlots: 1,
    price: 10000,
    isLive: false
  },
  {
    id: "6",
    creatorId: "creator-6",
    creatorName: "癒しのボイスヒーラーASMR",
    avatar: "https://picsum.photos/150/150?random=6",
    productTitle: "おやすみ前のヒーリングトーク",
    productImage: "https://picsum.photos/400/500?random=16",
    dateTime: "2025-06-02T23:00:00",
    slotDuration: 15,
    type: "queue",
    totalSlots: 30,
    remainingSlots: 12,
    price: 2500,
    isLive: true
  },
  {
    id: "7",
    creatorId: "creator-7",
    creatorName: "キャリアコンサルタントMAYU",
    avatar: "https://picsum.photos/150/150?random=7",
    productTitle: "転職・キャリアアップ相談",
    productImage: "https://picsum.photos/400/500?random=17",
    dateTime: "2025-06-03T11:00:00",
    slotDuration: 50,
    type: "slot",
    totalSlots: 2,
    remainingSlots: 0,
    price: 8000,
    isLive: false
  },
  {
    id: "8",
    creatorId: "creator-8",
    creatorName: "旅人トラベラー✈️KEN",
    avatar: "https://picsum.photos/150/150?random=8",
    productTitle: "次の旅行先、一緒に計画しませんか？",
    productImage: "https://picsum.photos/400/500?random=18",
    dateTime: "2025-06-03T16:00:00",
    slotDuration: 40,
    type: "slot",
    totalSlots: 6,
    remainingSlots: 6,
    price: 4500,
    isLive: false
  },
  {
    id: "9",
    creatorId: "creator-9",
    creatorName: "DJ MixMaster K",
    avatar: "https://picsum.photos/150/150?random=9",
    productTitle: "あなたのためのMix作成相談",
    productImage: "https://picsum.photos/400/500?random=19",
    dateTime: "2025-06-03T21:30:00",
    slotDuration: 20,
    type: "queue",
    totalSlots: 25,
    remainingSlots: 20,
    price: 7000,
    isLive: true
  },
  {
    id: "10",
    creatorId: "creator-10",
    creatorName: "占い師☆ミラ",
    avatar: "https://picsum.photos/150/150?random=10",
    productTitle: "タロットで見るあなたの運勢",
    productImage: "https://picsum.photos/400/500?random=20",
    dateTime: "2025-06-04T13:15:00",
    slotDuration: 10,
    type: "slot",
    totalSlots: 10,
    remainingSlots: 5,
    price: 1500,
    isLive: false
  },
  {
    id: "11",
    creatorId: "creator-11",
    creatorName: "ギタリスト🎸TAKA",
    avatar: "https://picsum.photos/150/150?random=11",
    productTitle: "ギターソロアドバイスします！",
    productImage: "https://picsum.photos/400/500?random=21",
    dateTime: "2025-06-04T19:00:00",
    slotDuration: 15,
    type: "queue",
    totalSlots: 12,
    remainingSlots: 3,
    price: 3000,
    isLive: true
  },
  {
    id: "12",
    creatorId: "creator-12",
    creatorName: "ももか🍑",
    avatar: "https://picsum.photos/150/150?random=10",
    productTitle: "筋トレ指導レッスン💪",
    productImage: "https://picsum.photos/400/500?random=20",
    dateTime: "2025-06-04T07:30:00",
    slotDuration: 45,
    type: "slot",
    totalSlots: 4,
    remainingSlots: 2,
    price: 6500,
    isLive: false
  }
];

// CallFeedFeature のエントリーポイント (サーバーコンポーネント)
export default async function CallFeedFeature() {
  const supabase = await createServerClient();
  
  // データベースから商品データを取得
  const { data: dbProducts, error } = await supabase
    .from('call_products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
  }

  // データベースから取得したデータをProduct型に変換
  let productsData: Product[] = [];
  
  if (dbProducts && dbProducts.length > 0) {
    // クリエイター情報を別途取得
    const creatorIds = [...new Set(dbProducts.map(p => p.creator_id))];
    const { data: creators } = await supabase
      .from('profiles')
      .select('id, display_name, email, avatar_url')
      .in('id', creatorIds);

    const creatorMap = new Map(creators?.map(c => [c.id, c]) || []);

    productsData = dbProducts.map((product, index) => {
      const creator = creatorMap.get(product.creator_id);
      return {
        id: product.id,
        creatorId: product.creator_id,
        creatorName: creator?.display_name || creator?.email || 'クリエイター',
        avatar: creator?.avatar_url || `https://picsum.photos/150/150?random=${index}`,
        productTitle: product.title,
        productImage: `https://picsum.photos/400/500?random=${10 + index}`,
        dateTime: product.slot_date ? `${product.slot_date}T${product.start_time}` : new Date().toISOString(),
        slotDuration: product.duration_minutes,
        type: product.type === 'queue' ? 'queue' : 'slot',
        totalSlots: product.max_participants || 10,
        remainingSlots: product.remaining_slots || 5,
        price: product.price,
        isLive: false // 仮の値
      };
    });
  } else {
    // データベースにデータがない場合はダミーデータを使用
    productsData = followedCreators;
  }

  const now = new Date();
  const processedProducts = productsData
    .filter(product => {
      const productDate = new Date(product.dateTime); // オリジナルのISO文字列で比較
      return productDate > now || (product.isLive && productDate.toDateString() === now.toDateString());
    })
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .map(product => ({
      ...product,
      dateTime: formatDateTime(product.dateTime), // 表示用にフォーマット
    }));

  return <CallProductFeedLayout products={processedProducts} />;
} 