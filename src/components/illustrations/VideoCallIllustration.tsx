export function VideoCallIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 背景の装飾 */}
      <circle cx="350" cy="50" r="30" fill="#E0E7FF" opacity="0.5" />
      <circle cx="50" cy="250" r="40" fill="#FEE2E2" opacity="0.5" />
      
      {/* メインのビデオフレーム */}
      <rect x="50" y="50" width="300" height="200" rx="8" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="2" />
      
      {/* ビデオ内の人物1（左側・ファン） */}
      <g transform="translate(80, 80)">
        {/* 髪の毛 */}
        <path d="M 5 30 C 5 15 20 5 40 5 C 60 5 75 15 75 30 C 75 35 70 35 70 40 L 10 40 C 10 35 5 35 5 30 Z" fill="#6B5D54" />
        {/* 顔 */}
        <ellipse cx="40" cy="45" rx="30" ry="35" fill="#FBBF24" />
        {/* 目 */}
        <ellipse cx="28" cy="40" rx="4" ry="6" fill="white" />
        <ellipse cx="52" cy="40" rx="4" ry="6" fill="white" />
        <circle cx="28" cy="40" r="3" fill="#374151" />
        <circle cx="52" cy="40" r="3" fill="#374151" />
        {/* 眉毛 */}
        <path d="M 22 32 Q 28 30 34 32" stroke="#6B5D54" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 46 32 Q 52 30 58 32" stroke="#6B5D54" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* 鼻 */}
        <path d="M 40 45 L 38 50 L 42 50 Z" fill="#F59E0B" opacity="0.5" />
        {/* 笑顔 */}
        <path d="M 25 55 Q 40 65 55 55" stroke="#374151" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* ほっぺた */}
        <circle cx="18" cy="52" r="5" fill="#FCA5A5" opacity="0.6" />
        <circle cx="62" cy="52" r="5" fill="#FCA5A5" opacity="0.6" />
        {/* 服 */}
        <path d="M 10 75 Q 40 70 70 75 L 70 100 L 10 100 Z" fill="#818CF8" />
        <rect x="35" y="70" width="10" height="30" fill="#6366F1" opacity="0.8" />
      </g>
      
      {/* ビデオ内の人物2（右側・クリエイター） */}
      <g transform="translate(230, 80)">
        {/* 髪の毛（長め） */}
        <path d="M 5 25 C 5 10 20 0 40 0 C 60 0 75 10 75 25 C 75 30 72 35 70 45 C 68 55 65 60 60 65 L 20 65 C 15 60 12 55 10 45 C 8 35 5 30 5 25 Z" fill="#EC4899" />
        {/* 顔 */}
        <ellipse cx="40" cy="45" rx="28" ry="33" fill="#FDE68A" />
        {/* 目（ウインク） */}
        <ellipse cx="28" cy="40" rx="4" ry="6" fill="white" />
        <circle cx="28" cy="40" r="3" fill="#374151" />
        <path d="M 48 40 Q 52 42 56 40" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* 眉毛 */}
        <path d="M 22 32 Q 28 30 34 32" stroke="#EC4899" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 46 30 Q 52 28 58 30" stroke="#EC4899" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* 鼻 */}
        <path d="M 40 45 L 38 48 L 42 48 Z" fill="#FCD34D" opacity="0.5" />
        {/* 笑顔 */}
        <path d="M 25 53 Q 40 60 55 53" stroke="#374151" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* ほっぺた */}
        <circle cx="18" cy="52" r="5" fill="#FCA5A5" opacity="0.7" />
        <circle cx="62" cy="52" r="5" fill="#FCA5A5" opacity="0.7" />
        {/* 服（クリエイターらしく） */}
        <path d="M 10 75 Q 40 70 70 75 L 70 100 L 10 100 Z" fill="#F472B6" />
        <circle cx="40" cy="85" r="4" fill="white" />
        {/* アクセサリー（イヤリング） */}
        <circle cx="12" cy="55" r="3" fill="#FCD34D" />
        <circle cx="68" cy="55" r="3" fill="#FCD34D" />
      </g>
      
      {/* ビデオコントロール */}
      <rect x="130" y="210" width="140" height="30" rx="15" fill="#1F2937" />
      <circle cx="150" cy="225" r="8" fill="#EF4444" />
      <rect x="170" y="217" width="16" height="16" rx="2" fill="#6B7280" />
      <rect x="195" y="217" width="16" height="16" rx="2" fill="#10B981" />
      <rect x="220" y="217" width="16" height="16" rx="2" fill="#6B7280" />
      <rect x="245" y="217" width="16" height="16" rx="2" fill="#6B7280" />
      
      {/* 接続線のアニメーション */}
      <path d="M 155 120 Q 200 100 245 120" stroke="#818CF8" strokeWidth="3" fill="none" strokeDasharray="5,5">
        <animate attributeName="stroke-dashoffset" from="10" to="0" dur="2s" repeatCount="indefinite" />
      </path>
      
      {/* ハートのアニメーション */}
      <g transform="translate(190, 90)">
        <path d="M 0,5 C 0,2.5 2.5,0 5,0 C 7.5,0 10,2.5 10,5 C 10,2.5 12.5,0 15,0 C 17.5,0 20,2.5 20,5 C 20,10 10,20 10,20 C 10,20 0,10 0,5 Z" fill="#EF4444">
          <animateTransform
            attributeName="transform"
            type="scale"
            values="0.8;1.2;0.8"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    </svg>
  )
}