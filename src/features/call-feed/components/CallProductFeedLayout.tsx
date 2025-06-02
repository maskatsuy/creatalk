'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CallProductCard, { type Product } from './CallProductCard'; // Product型もインポート
import { Heart } from 'lucide-react'; // 空の状態表示用

interface CallProductFeedLayoutProps {
  products: Product[];
}

export default function CallProductFeedLayout({ products }: CallProductFeedLayoutProps) {
  const router = useRouter();

  const handleSearchCreators = () => {
    router.push('/search');
  };

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

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <CallProductCard key={product.id} product={product} />
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
            <button 
              onClick={handleSearchCreators}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              クリエイターを探す
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 