import { Suspense } from 'react';
import WaitingRoomContent from './WaitingRoomContent';

export default function WaitingRoomPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-zinc-100 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">読み込み中...</p>
        </div>
      </div>
    }>
      <WaitingRoomContent />
    </Suspense>
  );
}