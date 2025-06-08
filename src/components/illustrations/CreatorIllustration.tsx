export function CreatorIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 背景の装飾 */}
      <circle cx="320" cy="80" r="20" fill="#FEF3C7" opacity="0.6" />
      <circle cx="80" cy="200" r="25" fill="#E0E7FF" opacity="0.6" />
      <rect x="300" y="200" width="15" height="15" rx="3" fill="#F3E8FF" opacity="0.7" transform="rotate(45 307.5 207.5)" />
      
      {/* クリエイターの人物 */}
      <g transform="translate(150, 50)">
        {/* 髪の毛（スタイリッシュ） */}
        <path d="M 5 35 C 5 15 25 0 50 0 C 75 0 95 15 95 35 C 95 40 90 45 85 50 C 80 55 75 60 70 65 L 30 65 C 25 60 20 55 15 50 C 10 45 5 40 5 35 Z" fill="#7C3AED" />
        {/* 前髪 */}
        <path d="M 25 30 C 30 20 40 15 50 15 C 60 15 70 20 75 30 C 70 35 60 40 50 40 C 40 40 30 35 25 30 Z" fill="#8B5CF6" />
        
        {/* 顔 */}
        <ellipse cx="50" cy="55" rx="35" ry="40" fill="#FDE68A" />
        
        {/* 目（キラキラ） */}
        <ellipse cx="35" cy="45" rx="6" ry="8" fill="white" />
        <ellipse cx="65" cy="45" rx="6" ry="8" fill="white" />
        <circle cx="35" cy="45" r="4" fill="#374151" />
        <circle cx="65" cy="45" r="4" fill="#374151" />
        <circle cx="36" cy="43" r="1.5" fill="white" />
        <circle cx="66" cy="43" r="1.5" fill="white" />
        
        {/* 眉毛 */}
        <path d="M 25 35 Q 35 32 45 35" stroke="#7C3AED" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 55 35 Q 65 32 75 35" stroke="#7C3AED" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        
        {/* 鼻 */}
        <path d="M 50 50 L 47 55 L 53 55 Z" fill="#FCD34D" opacity="0.6" />
        
        {/* 笑顔（自信満々） */}
        <path d="M 25 65 Q 50 80 75 65" stroke="#374151" strokeWidth="3" fill="none" strokeLinecap="round" />
        
        {/* ほっぺた */}
        <circle cx="15" cy="60" r="6" fill="#FCA5A5" opacity="0.7" />
        <circle cx="85" cy="60" r="6" fill="#FCA5A5" opacity="0.7" />
        
        {/* 体（カジュアルなシャツ） */}
        <path d="M 15 90 Q 50 85 85 90 L 85 170 L 15 170 Z" fill="#8B5CF6" />
        <path d="M 25 95 Q 50 90 75 95 L 75 105 L 25 105 Z" fill="#A855F7" />
        
        {/* 腕 */}
        <ellipse cx="5" cy="115" rx="12" ry="18" fill="#FDE68A" />
        <ellipse cx="95" cy="115" rx="12" ry="18" fill="#FDE68A" />
        
        {/* 手（ポーズ） */}
        <circle cx="5" cy="135" r="8" fill="#FDE68A" />
        <circle cx="95" cy="135" r="8" fill="#FDE68A" />
        
        {/* アクセサリー（ネックレス） */}
        <circle cx="50" cy="90" r="3" fill="#F59E0B" />
        <path d="M 40 87 Q 50 85 60 87" stroke="#F59E0B" strokeWidth="2" fill="none" />
      </g>
      
      {/* マイク */}
      <g transform="translate(100, 120)">
        <rect x="0" y="0" width="12" height="30" rx="6" fill="#374151" />
        <rect x="-5" y="35" width="22" height="8" rx="4" fill="#6B7280" />
        <line x1="6" y1="43" x2="6" y2="55" stroke="#6B7280" strokeWidth="2" />
      </g>
      
      {/* カメラ */}
      <g transform="translate(280, 120)">
        <rect x="0" y="0" width="25" height="18" rx="3" fill="#1F2937" />
        <circle cx="12.5" cy="9" r="6" fill="#374151" />
        <circle cx="12.5" cy="9" r="3" fill="#EF4444" />
        <rect x="25" y="6" width="8" height="6" rx="1" fill="#1F2937" />
      </g>
      
      {/* 収益のアイコン */}
      <g transform="translate(50, 180)">
        <circle cx="20" cy="20" r="18" fill="#10B981" />
        <text x="20" y="27" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">¥</text>
        {/* お金のアニメーション */}
        <g>
          <circle cx="60" cy="15" r="8" fill="#FBBF24">
            <animate attributeName="cy" values="15;5;15" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="80" cy="25" r="6" fill="#FBBF24">
            <animate attributeName="cy" values="25;15;25" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite" />
          </circle>
        </g>
      </g>
      
      {/* スケジュール */}
      <g transform="translate(250, 180)">
        <rect x="0" y="0" width="50" height="40" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="2" />
        <rect x="0" y="0" width="50" height="12" rx="4" fill="#8B5CF6" />
        <circle cx="12" cy="6" r="2" fill="white" />
        <circle cx="38" cy="6" r="2" fill="white" />
        <line x1="10" y1="20" x2="40" y2="20" stroke="#D1D5DB" strokeWidth="1" />
        <line x1="10" y1="26" x2="30" y2="26" stroke="#D1D5DB" strokeWidth="1" />
        <line x1="10" y1="32" x2="35" y2="32" stroke="#8B5CF6" strokeWidth="2" />
      </g>
      
      {/* ファンからのハート */}
      <g transform="translate(320, 100)">
        <path d="M 0,3 C 0,1.5 1.5,0 3,0 C 4.5,0 6,1.5 6,3 C 6,1.5 7.5,0 9,0 C 10.5,0 12,1.5 12,3 C 12,6 6,12 6,12 C 6,12 0,6 0,3 Z" fill="#EF4444">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -10,-10; 0,0"
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
      
      <g transform="translate(30, 80)">
        <path d="M 0,3 C 0,1.5 1.5,0 3,0 C 4.5,0 6,1.5 6,3 C 6,1.5 7.5,0 9,0 C 10.5,0 12,1.5 12,3 C 12,6 6,12 6,12 C 6,12 0,6 0,3 Z" fill="#F472B6">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 10,-15; 0,0"
            dur="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    </svg>
  )
}