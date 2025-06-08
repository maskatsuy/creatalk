export function ModernVideoCallIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 500 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 背景の装飾要素 */}
      <circle cx="450" cy="50" r="30" fill="#3B82F6" opacity="0.1" />
      <circle cx="50" cy="350" r="40" fill="#8B5CF6" opacity="0.1" />
      <path d="M 420 100 L 440 120 L 460 100" stroke="#EC4899" strokeWidth="2" opacity="0.3" />
      <path d="M 30 250 L 50 270 L 70 250" stroke="#10B981" strokeWidth="2" opacity="0.3" />
      
      {/* デスク - 位置を上に調整 */}
      <rect x="100" y="300" width="300" height="8" rx="4" fill="#E5E7EB" />
      
      {/* モニター */}
      <rect x="140" y="150" width="220" height="140" rx="8" fill="#1F2937" />
      <rect x="150" y="160" width="200" height="120" rx="4" fill="#F3F4F6" />
      <rect x="240" y="290" width="20" height="30" fill="#9CA3AF" />
      <rect x="220" y="320" width="60" height="6" rx="3" fill="#9CA3AF" />
      
      {/* ビデオ画面内のUI */}
      <g>
        {/* 左側の人物（ユーザー） - シンプル化 */}
        <g transform="translate(170, 180)">
          <rect x="0" y="0" width="70" height="80" rx="4" fill="#E0E7FF" />
          
          {/* 簡略化された人物 */}
          <g transform="translate(35, 40)">
            {/* 頭と体の統合形状 */}
            <circle cx="0" cy="-10" r="15" fill="#3B82F6" />
            <rect x="-18" y="-5" width="36" height="40" rx="18" fill="#3B82F6" />
            {/* 顔（ドット） */}
            <circle cx="-5" cy="-10" r="2" fill="#E0E7FF" />
            <circle cx="5" cy="-10" r="2" fill="#E0E7FF" />
            <path d="M -3 -5 Q 0 -3 3 -5" stroke="#E0E7FF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* ノートアイコン（相談・学習を表現） */}
            <rect x="10" y="10" width="12" height="15" rx="2" fill="#E0E7FF" />
            <line x1="13" y1="15" x2="19" y2="15" stroke="#3B82F6" strokeWidth="1" />
            <line x1="13" y1="18" x2="17" y2="18" stroke="#3B82F6" strokeWidth="1" />
          </g>
        </g>
        
        {/* 右側の人物（クリエイター） - シンプル化 */}
        <g transform="translate(260, 180)">
          <rect x="0" y="0" width="70" height="80" rx="4" fill="#FEE2E2" />
          
          {/* 簡略化された人物 */}
          <g transform="translate(35, 40)">
            {/* 頭と体の統合形状 */}
            <circle cx="0" cy="-10" r="15" fill="#EC4899" />
            <rect x="-18" y="-5" width="36" height="40" rx="18" fill="#EC4899" />
            {/* 顔（ドット） */}
            <circle cx="-5" cy="-10" r="2" fill="#FEE2E2" />
            <circle cx="5" cy="-10" r="2" fill="#FEE2E2" />
            <path d="M -3 -5 Q 0 -3 3 -5" stroke="#FEE2E2" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* 電球アイコン（知識共有を表現） */}
            <circle cx="20" cy="-15" r="7" fill="#FCD34D" opacity="0.8" />
            <rect x="18" y="-8" width="4" height="3" rx="1" fill="#F59E0B" />
            <path d="M 16 -18 Q 20 -22 24 -18" stroke="#F59E0B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
        </g>
      </g>
      
      {/* コントロールバー */}
      <rect x="150" y="260" width="200" height="20" rx="10" fill="#374151" opacity="0.9" />
      <circle cx="170" cy="270" r="5" fill="#EF4444" />
      <rect x="190" y="265" width="10" height="10" rx="2" fill="#6B7280" />
      <rect x="210" y="265" width="10" height="10" rx="2" fill="#10B981" />
      <rect x="230" y="265" width="10" height="10" rx="2" fill="#6B7280" />
      
      {/* キーボード - 位置を上に調整 */}
      <g transform="translate(150, 310)">
        <rect x="0" y="0" width="200" height="60" rx="8" fill="#E5E7EB" />
        <rect x="10" y="10" width="180" height="40" rx="4" fill="#F9FAFB" />
        {/* キー（簡略化） */}
        <rect x="20" y="20" width="20" height="20" rx="2" fill="#E5E7EB" />
        <rect x="45" y="20" width="20" height="20" rx="2" fill="#E5E7EB" />
        <rect x="70" y="20" width="20" height="20" rx="2" fill="#E5E7EB" />
        <rect x="95" y="20" width="20" height="20" rx="2" fill="#E5E7EB" />
        <rect x="120" y="20" width="20" height="20" rx="2" fill="#E5E7EB" />
        <rect x="145" y="20" width="20" height="20" rx="2" fill="#E5E7EB" />
      </g>
      
      {/* 装飾的な要素 - 位置を調整 */}
      <g opacity="0.6">
        {/* 音波 */}
        <path d="M 370 200 Q 380 195 390 200" stroke="#8B5CF6" strokeWidth="2" fill="none" />
        <path d="M 370 210 Q 385 205 400 210" stroke="#8B5CF6" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M 370 220 Q 390 215 410 220" stroke="#8B5CF6" strokeWidth="1" fill="none" opacity="0.4" />
        
        {/* 接続線を追加 */}
        <path d="M 100 250 Q 200 240 300 250" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeDasharray="3,3" opacity="0.5">
          <animate attributeName="stroke-dashoffset" from="6" to="0" dur="2s" repeatCount="indefinite" />
        </path>
      </g>
      
      {/* ハートのフローティング */}
      <g>
        <path d="M 0,3 C 0,1.5 1.5,0 3,0 C 4.5,0 6,1.5 6,3 C 6,1.5 7.5,0 9,0 C 10.5,0 12,1.5 12,3 C 12,6 6,12 6,12 C 6,12 0,6 0,3 Z" fill="#EC4899" transform="translate(400, 150)">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="400,150; 410,130; 400,150"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    </svg>
  )
}