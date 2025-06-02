import CallFeedFeature from '@/features/call-feed'; // index.tsxは省略可能

// 元のコード (Product interface, followedCreators, formatDateTime, ProductCard, CreatorFeedHome) はすべて削除
// createServerClientWithCookies や cookies のインポートも、CallFeedFeature内で処理されるため不要

export default async function HomePage() {
  // データ取得や認証関連のロジックは CallFeedFeature に移動したため、ここではシンプルに呼び出すだけ
  return <CallFeedFeature />;
}
