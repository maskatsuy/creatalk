import { cookies } from 'next/headers'
// import Link from 'next/link' // Commented out as it's not used in the new code
import { Button } from '@/components/ui/button' 
import { createServerClientWithCookies } from '@/lib/supabase-server'
import type { Database } from '@/types/database'
import React from 'react'; 
import { Calendar, Clock, Users, Video, Heart, Star } from 'lucide-react'; 

interface Product {
  id: number;
  creatorName: string;
  avatar: string;
  productTitle: string;
  productImage: string;
  dateTime: string;
  slotDuration: number;
  type: "slot" | "queue";
  totalSlots: number;
  remainingSlots: number;
  price: number;
  isLive: boolean;
}

const followedCreators: Product[] = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
    creatorName: "りんりん⭐",
    avatar: "https://picsum.photos/150/150?random=4",
    productTitle: "アイドル練習生時代の秘話💖",
    productImage: "https://picsum.photos/400/500?random=14",
    dateTime: "2025-06-01T22:00:00", 
    slotDuration: 7,
    type: "slot",
    totalSlots: 10,
    remainingSlots: 0,
    price: 8500,
    isLive: false
  },
  {
    id: 4,
    creatorName: "なつきVT🎮",
    avatar: "https://picsum.photos/150/150?random=9",
    productTitle: "ホラゲー実況の感想戦😱",
    productImage: "https://picsum.photos/400/500?random=19",
    dateTime: "2025-06-01T23:00:00", 
    slotDuration: 4,
    type: "queue",
    totalSlots: 18,
    remainingSlots: 11,
    price: 4500,
    isLive: false
  },
  {
    id: 5,
    creatorName: "ゆめぴ🌙",
    avatar: "https://picsum.photos/150/150?random=5",
    productTitle: "今日のコーデ見せちゃう👗",
    productImage: "https://picsum.photos/400/500?random=15",
    dateTime: "2025-06-02T18:00:00", 
    slotDuration: 8,
    type: "queue",
    totalSlots: 8,
    remainingSlots: 3,
    price: 9000,
    isLive: false
  },
  {
    id: 6,
    creatorName: "エマちゃん🌍",
    avatar: "https://picsum.photos/150/150?random=23",
    productTitle: "英会話レッスン 😊",
    productImage: "https://picsum.photos/400/500?random=24",
    dateTime: "2025-06-02T19:00:00", 
    slotDuration: 30,
    type: "slot",
    totalSlots: 8,
    remainingSlots: 6,
    price: 5000,
    isLive: false
  },
  {
    id: 7,
    creatorName: "桜井みか🌸",
    avatar: "https://picsum.photos/150/150?random=3",
    productTitle: "新作コスプレお披露目♪",
    productImage: "https://picsum.photos/400/500?random=13",
    dateTime: "2025-06-02T20:00:00", 
    slotDuration: 10,
    type: "queue",
    totalSlots: 12,
    remainingSlots: 12,
    price: 12000,
    isLive: false
  },
  {
    id: 8,
    creatorName: "あやぴー💫",
    avatar: "https://picsum.photos/150/150?random=7",
    productTitle: "お悩み相談聞くよ〜♡",
    productImage: "https://picsum.photos/400/500?random=17",
    dateTime: "2025-06-02T21:30:00", 
    slotDuration: 12,
    type: "queue",
    totalSlots: 6,
    remainingSlots: 4,
    price: 13000,
    isLive: false
  },
  {
    id: 9,
    creatorName: "ちひろ🎨",
    avatar: "https://picsum.photos/150/150?random=21",
    productTitle: "イラストの描き方講座✏️",
    productImage: "https://picsum.photos/400/500?random=22",
    dateTime: "2025-06-03T16:00:00", 
    slotDuration: 60,
    type: "queue",
    totalSlots: 5,
    remainingSlots: 1,
    price: 8000,
    isLive: false
  },
  {
    id: 10,
    creatorName: "みゆちん👼",
    avatar: "https://picsum.photos/150/150?random=6",
    productTitle: "メイドカフェごっこ☕",
    productImage: "https://picsum.photos/400/500?random=16",
    dateTime: "2025-06-03T19:00:00", 
    slotDuration: 5,
    type: "slot",
    totalSlots: 25,
    remainingSlots: 18,
    price: 5500,
    isLive: false
  },
  {
    id: 11,
    creatorName: "ひなた🌻",
    avatar: "https://picsum.photos/150/150?random=8",
    productTitle: "今日の撮影裏話🎬",
    productImage: "https://picsum.photos/400/500?random=18",
    dateTime: "2025-06-03T20:00:00", 
    slotDuration: 6,
    type: "slot",
    totalSlots: 12,
    remainingSlots: 9,
    price: 7000,
    isLive: false
  },
  {
    id: 12,
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

function formatDateTime(dateTimeString: string) { 
  const date = new Date(dateTimeString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  let dateLabel;
  if (targetDate.getTime() === today.getTime()) {
    dateLabel = "今日";
  } else if (targetDate.getTime() === tomorrow.getTime()) {
    dateLabel = "明日";
  } else {
    dateLabel = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`; 
  }
  
  const time = date.toLocaleTimeString('ja-JP', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  
  return `${dateLabel} ${time}〜`;
}

function ProductCard({ product }: { product: Product }) { 
  const isUrgent = product.remainingSlots <= 3 && product.remainingSlots > 0;
  const isSoldOut = product.remainingSlots === 0;
  
  return (
    <div className="group relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-100 dark:hover:shadow-zinc-900/20 hover:-translate-y-2">
      {/* 背景画像 */}
      <div className="relative h-48 overflow-hidden"> {/* Restored h-48 */}
        <img 
          src={product.productImage} 
          alt={product.productTitle}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        {product.isLive && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
          </div>
        )}
        
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
            <div className="bg-zinc-800 text-white font-bold px-6 py-3 rounded-xl border border-zinc-600">
              SOLD OUT
            </div>
          </div>
        )}
        
        <div className="absolute bottom-3 left-3 right-3">
          <h4 className="font-bold text-xl text-white drop-shadow-lg line-clamp-2 mb-2">
            {product.productTitle}
          </h4>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <img 
                src={product.avatar} 
                alt={product.creatorName}
                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-lg"
              />
              {product.isLive && (
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></div>
              )}
            </div>
            <div className="text-white">
              <div className="font-semibold text-sm drop-shadow-lg">
                {product.creatorName}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDateTime(product.dateTime)}</span>
          </div>
          
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.type === 'queue' 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
          }`}>
            {product.type === 'queue' ? '先着制' : '時間制'}
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-500" />
            <span className={`text-sm font-medium ${
              isUrgent 
                ? 'text-orange-600 dark:text-orange-400' 
                : isSoldOut
                ? 'text-red-600 dark:text-red-400'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}>
              残り{product.remainingSlots}枠
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              ({product.slotDuration}分/枠)
            </span>
          </div>
          
          <div className="text-zinc-500 text-xs">
            全{product.totalSlots}枠
          </div>
        </div>
        
        <div className="flex flex-col gap-2"> {/* Restored flex-col layout for price and button */}
          <div className="text-right">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              ¥{product.price.toLocaleString()}
            </div>
          </div>
          
          <Button 
            disabled={isSoldOut}
            variant={isUrgent ? "default" : "secondary"} /* Restored variant logic */
            size="sm"
            className={`w-full ${ 
              isSoldOut
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {isSoldOut ? '売り切れ' : isUrgent ? '急いで予約' : '予約する'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CreatorFeedHome() { 
  const availableProducts = followedCreators.filter(product => {
    const productDate = new Date(product.dateTime);
    const now = new Date();
    return productDate > now || (product.isLive && productDate.toDateString() === now.toDateString());
  }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()); 

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            フォロー中のクリエイター
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            お気に入りのクリエイターの最新通話をチェックしよう
          </p>
        </div>

        {availableProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6"> 
            {availableProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-12 h-12 text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              まだ通話予定がありません
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              フォロー中のクリエイターからの新しい通話予定をお待ちください
            </p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              クリエイターを探す
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


export default async function HomePage() {
  const cookieStore = await cookies()
  const supabase = createServerClientWithCookies<Database>(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  return <CreatorFeedHome />;

  /*
  // Original HomePage content (commented out)
  // ... (The original HomePage logic based on user auth state, creator status, etc.)
  // This part is kept as a reference from the initial state provided in the conversation.
  // Depending on the desired final state, this might need to be uncommented and integrated.
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Creatalk</h1>
      <div className="space-y-6">
        {!user ? (
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">クリエイターとファンをつなぐプラットフォーム</h2>
            <p className="text-zinc-600 mb-6">
              Creatalkは、クリエイターとファンを1対1のビデオ通話でつなぐプラットフォームです。
              より直接的で価値のある交流を実現します。
            </p>
            // <Button asChild> // Assuming original Button was from shadcn/ui
            //   <Link href="/login">ログインして始める</Link>
            // </Button>
          </div>
        ) : // ... (isCreator, hasPendingApplication logic would go here)
        ( 
          // Fallback for logged-in user if not creator and no pending application
          // This part was also in the original user-provided code block
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">クリエイターになる</h2>
            <p className="text-zinc-600 mb-6">
              あなたのクリエイティブな活動をファンと直接共有しませんか？
              クリエイターとして登録して、ファンとの1対1のビデオ通話を始めましょう。
            </p>
            // <Button asChild>
            //   <Link href="/creator/apply">クリエイターとして申請する</Link>
            // </Button>
          </div>
        )}
      </div>
    </div>
  )
  */
}
