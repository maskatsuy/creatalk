'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Calendar, Users } from 'lucide-react';
import { createCheckoutSession } from '@/actions/stripe';
import { toast } from 'sonner';

export interface Product {
  id: string;
  creatorId: string;
  creatorName: string;
  avatar: string;
  productTitle: string;
  productImage: string;
  dateTime: string; // フォーマット済みの文字列を受け取る
  slotDuration: number;
  type: "slot" | "queue";
  totalSlots: number;
  remainingSlots: number;
  price: number;
  isLive: boolean;
}

// formatDateTime 関数の仮プレースホルダーは不要なので削除

export default function CallProductCard({ product }: { product: Product }) {
  const [isLoading, setIsLoading] = useState(false);
  const isUrgent = product.remainingSlots <= 3 && product.remainingSlots > 0;
  const isSoldOut = product.remainingSlots === 0;

  const handleReservation = async () => {
    if (product.type === 'queue') {
      // 先着制の場合はStripe決済へ
      setIsLoading(true);
      try {
        await createCheckoutSession(product.id, product.creatorId);
      } catch (error) {
        console.error('Error creating checkout session:', error);
        toast.error('予約処理中にエラーが発生しました');
        setIsLoading(false);
      }
    } else {
      // 時間制は別途実装
      toast.info('時間制の予約は現在準備中です');
    }
  };

  return (
    <div className="group relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-100 dark:hover:shadow-zinc-900/20 hover:-translate-y-2">
      {/* 背景画像 */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={product.productImage}
          alt={product.productTitle}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
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
              <Image
                src={product.avatar}
                alt={product.creatorName}
                width={32}
                height={32}
                className="rounded-full object-cover border-2 border-white shadow-lg"
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
            <span>{product.dateTime}</span> {/* propsで渡されたフォーマット済み文字列を表示 */}
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

        <div className="flex flex-col gap-2">
          <div className="text-right">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              ¥{product.price.toLocaleString()}
            </div>
          </div>

          <Button
            disabled={isSoldOut || isLoading}
            variant={isUrgent ? "default" : "secondary"}
            size="sm"
            className={`w-full ${
              isSoldOut || isLoading
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            onClick={handleReservation}
          >
            {isLoading ? '処理中...' : isSoldOut ? '売り切れ' : isUrgent ? '急いで予約' : '予約する'}
          </Button>
        </div>
      </div>
    </div>
  );
} 