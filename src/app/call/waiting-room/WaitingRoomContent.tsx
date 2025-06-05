'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPaymentSession } from '@/actions/stripe';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Video, Mic, Settings, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CallProduct {
  id: string;
  creator_id: string;
  type: string;
  slot_date: string;
  start_time: string;
  end_time?: string;
  price: number;
  profiles: {
    display_name: string;
    avatar_url?: string;
  };
}

export default function WaitingRoomContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [product, setProduct] = useState<CallProduct | null>(null);
  const [timeUntilCall, setTimeUntilCall] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const verifyAndCreateBooking = async () => {
      const sessionId = searchParams.get('session_id');
      const productId = searchParams.get('product_id');

      if (!sessionId || !productId) {
        toast.error('無効なアクセスです');
        router.push('/');
        return;
      }

      try {
        // Stripe決済の確認
        const { success, error, metadata, paymentIntent } = await verifyPaymentSession(sessionId);
        
        if (!success || !metadata) {
          toast.error(error || '決済の確認に失敗しました');
          router.push('/');
          return;
        }

        // 商品情報を取得
        // supabase is already imported
        const { data: productData, error: productError } = await supabase
          .from('call_products')
          .select('*, profiles!call_products_creator_id_fkey(display_name, avatar_url)')
          .eq('id', productId)
          .single();

        if (productError || !productData) {
          toast.error('商品情報の取得に失敗しました');
          router.push('/');
          return;
        }

        // 予約情報を作成
        const { error: bookingError } = await supabase
          .from('call_bookings')
          .insert({
            product_id: productId,
            user_id: metadata.userId,
            creator_id: metadata.creatorId,
            payment_intent_id: paymentIntent,
            status: 'confirmed',
            amount: productData.price,
          });

        if (bookingError) {
          console.error('Booking creation error:', bookingError);
          toast.error('予約の作成に失敗しました');
          router.push('/');
          return;
        }

        setProduct(productData);
        setIsValid(true);
        toast.success('決済が完了しました！通話開始までお待ちください。');
      } catch (error) {
        console.error('Verification error:', error);
        toast.error('エラーが発生しました');
        router.push('/');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAndCreateBooking();
  }, [searchParams, router]);

  // 通話開始までの時間を計算
  useEffect(() => {
    if (!product) return;

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const callDateTime = new Date(`${product.slot_date}T${product.start_time}`);
      const diff = callDateTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeUntilCall('まもなく開始');
        // TODO: 実際の通話ルームへ遷移
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeUntilCall(`${hours}時間 ${minutes}分 ${seconds}秒`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [product]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-zinc-100 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">決済を確認中...</p>
        </div>
      </div>
    );
  }

  if (!isValid || !product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6" />
              <h1 className="text-2xl font-bold">予約が確定しました！</h1>
            </div>
            <p className="text-violet-100">
              通話開始まで、この画面でお待ちください。
            </p>
          </div>

          {/* メインコンテンツ */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* 左側: クリエイター情報 */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                  通話相手
                </h2>
                <div className="flex items-center gap-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {product.profiles.display_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {product.profiles.display_name}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {product.type === 'queue' ? '先着制' : '時間制'}
                    </p>
                  </div>
                </div>

                {/* 通話情報 */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                    <Clock className="w-5 h-5 text-zinc-500" />
                    <div>
                      <p className="font-medium">開始時刻</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {product.slot_date} {product.start_time}
                        {product.end_time && ` - ${product.end_time}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                    <Users className="w-5 h-5 text-zinc-500" />
                    <div>
                      <p className="font-medium">通話形式</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        1対1のビデオ通話
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右側: カウントダウンと準備 */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                  通話開始まで
                </h2>
                <div className="p-6 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl text-center">
                  <p className="text-4xl font-bold text-violet-600 dark:text-violet-400">
                    {timeUntilCall || '計算中...'}
                  </p>
                  <p className="text-sm text-violet-600 dark:text-violet-400 mt-2">
                    現在時刻: {currentTime.toLocaleTimeString('ja-JP')}
                  </p>
                </div>

                {/* 準備チェックリスト */}
                <div className="mt-6">
                  <h3 className="font-medium mb-3 text-zinc-900 dark:text-zinc-100">
                    通話前の準備
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        カメラとマイクの動作確認
                      </span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        静かな環境の確保
                      </span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        安定したインターネット接続
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* デバイステスト */}
            <div className="mt-8 p-6 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                デバイステスト
              </h3>
              <div className="flex gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  カメラテスト
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  マイクテスト
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  設定
                </Button>
              </div>
            </div>

            {/* 注意事項 */}
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-1">ご注意ください</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300">
                    <li>開始時刻の5分前には準備を完了してください</li>
                    <li>通話が開始されない場合は、ページを再読み込みしてください</li>
                    <li>キャンセルはできません</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}