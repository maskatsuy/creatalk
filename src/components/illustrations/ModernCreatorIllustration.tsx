export function ModernCreatorIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 500 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 背景の装飾要素 */}
      <circle cx="450" cy="70" r="25" fill="#8B5CF6" opacity="0.1" />
      <circle cx="50" cy="320" r="35" fill="#EC4899" opacity="0.1" />
      <rect x="400" y="300" width="12" height="12" rx="2" fill="#10B981" opacity="0.3" transform="rotate(45 406 306)" />
      <path d="M 30 100 L 50 120 L 70 100" stroke="#F59E0B" strokeWidth="2" opacity="0.4" />
      
      {/* デスク */}
      <rect x="80" y="320" width="340" height="10" rx="5" fill="#E5E7EB" />
      
      {/* モニター（メイン） */}
      <rect x="120" y="120" width="260" height="180" rx="12" fill="#1F2937" />
      <rect x="135" y="135" width="230" height="150" rx="6" fill="#F8FAFC" />
      
      {/* モニタースタンド */}
      <rect x="235" y="300" width="30" height="25" fill="#9CA3AF" />
      <rect x="200" y="320" width="100" height="8" rx="4" fill="#9CA3AF" />
      
      {/* ライブストリーミング画面 */}
      <g>
        {/* 配信者の映像枠 */}
        <rect x="150" y="145" width="200" height="130" rx="4" fill="#EDE9FE" />
        
        {/* メインの人物（配信者） - シンプル化 */}
        <g transform="translate(250, 185) scale(1.5)">
          {/* 頭（円形） */}
          <circle cx="0" cy="0" r="18" fill="#8B5CF6" />
          
          {/* 顔のカットアウト（ネガティブスペース） */}
          <circle cx="-6" cy="-2" r="2.5" fill="#EDE9FE" />
          <circle cx="6" cy="-2" r="2.5" fill="#EDE9FE" />
          <path d="M -6 5 Q 0 8 6 5" stroke="#EDE9FE" strokeWidth="2" fill="none" strokeLinecap="round" />
          
          {/* 体（肩と胴体） - 枠の下まで延長 */}
          <path d="M -25 28 C -25 22 -18 18 -10 18 L 10 18 C 18 18 25 22 25 28 L 25 50 L -25 50 Z" fill="#8B5CF6" />
          
          {/* 星（成功を表現） */}
          <g transform="translate(25, -10)">
            <path d="M 0,-5 L 1.2,-1.2 L 5,-1.2 L 1.8,1.2 L 3,5 L 0,2.4 L -3,5 L -1.8,1.2 L -5,-1.2 L -1.2,-1.2 Z" fill="#FCD34D">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
            </path>
          </g>
        </g>
        
        {/* ライブアイコン */}
        <g transform="translate(160, 155)">
          <rect x="0" y="0" width="30" height="12" rx="6" fill="#EF4444" />
          <text x="15" y="8" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">LIVE</text>
        </g>
      </g>
      
      {/* マイク（プロ仕様） */}
      <g transform="translate(50, 200)">
        <rect x="0" y="0" width="15" height="80" rx="7.5" fill="#374151" />
        <rect x="-5" y="85" width="25" height="15" rx="7.5" fill="#6B7280" />
        <line x1="7.5" y1="100" x2="7.5" y2="130" stroke="#6B7280" strokeWidth="3" />
        <rect x="-10" y="130" width="35" height="8" rx="4" fill="#6B7280" />
        {/* 音のインジケーター */}
        <g opacity="0.8">
          <rect x="20" y="10" width="3" height="8" fill="#10B981" rx="1.5">
            <animate attributeName="height" values="8;20;8" dur="1s" repeatCount="indefinite" />
            <animate attributeName="y" values="10;4;10" dur="1s" repeatCount="indefinite" />
          </rect>
          <rect x="25" y="15" width="3" height="12" fill="#10B981" rx="1.5">
            <animate attributeName="height" values="12;25;12" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="y" values="15;8;15" dur="1.2s" repeatCount="indefinite" />
          </rect>
          <rect x="30" y="20" width="3" height="6" fill="#10B981" rx="1.5">
            <animate attributeName="height" values="6;15;6" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="y" values="20;12;20" dur="0.8s" repeatCount="indefinite" />
          </rect>
        </g>
      </g>
      
      {/* カメラ */}
      <g transform="translate(400, 150)">
        <rect x="0" y="0" width="40" height="25" rx="5" fill="#1F2937" />
        <circle cx="20" cy="12.5" r="8" fill="#374151" />
        <circle cx="20" cy="12.5" r="5" fill="#EF4444" />
        <rect x="40" y="8" width="12" height="9" rx="2" fill="#1F2937" />
        {/* 録画インジケーター */}
        <circle cx="35" cy="5" r="2" fill="#EF4444">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>
      
      {/* 成長を表すグラフアイコン */}
      <g transform="translate(380, 250)">
        <rect x="0" y="0" width="60" height="40" rx="8" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="2" />
        {/* 棒グラフ */}
        <rect x="10" y="25" width="8" height="10" rx="1" fill="#9CA3AF" />
        <rect x="22" y="20" width="8" height="15" rx="1" fill="#8B5CF6" />
        <rect x="34" y="15" width="8" height="20" rx="1" fill="#10B981" />
        {/* 上昇矢印 */}
        <path d="M 45 10 L 50 5 L 55 10" stroke="#10B981" strokeWidth="2" fill="none" strokeLinecap="round">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        </path>
      </g>
      
      {/* スケジュール（タブレット風） */}
      <g transform="translate(420, 280)">
        <rect x="0" y="0" width="60" height="80" rx="8" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="2" />
        <rect x="5" y="5" width="50" height="10" rx="2" fill="#8B5CF6" />
        <line x1="10" y1="25" x2="45" y2="25" stroke="#D1D5DB" strokeWidth="1" />
        <line x1="10" y1="35" x2="35" y2="35" stroke="#D1D5DB" strokeWidth="1" />
        <line x1="10" y1="45" x2="40" y2="45" stroke="#8B5CF6" strokeWidth="2" />
        <line x1="10" y1="55" x2="30" y2="55" stroke="#D1D5DB" strokeWidth="1" />
        <line x1="10" y1="65" x2="45" y2="65" stroke="#D1D5DB" strokeWidth="1" />
      </g>
      
      {/* フローティングハート */}
      <g>
        <path d="M 0,3 C 0,1.5 1.5,0 3,0 C 4.5,0 6,1.5 6,3 C 6,1.5 7.5,0 9,0 C 10.5,0 12,1.5 12,3 C 12,6 6,12 6,12 C 6,12 0,6 0,3 Z" fill="#EC4899" transform="translate(350, 100)">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="350,100; 340,80; 350,100"
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
        
        <path d="M 0,3 C 0,1.5 1.5,0 3,0 C 4.5,0 6,1.5 6,3 C 6,1.5 7.5,0 9,0 C 10.5,0 12,1.5 12,3 C 12,6 6,12 6,12 C 6,12 0,6 0,3 Z" fill="#F472B6" transform="translate(100, 150)">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="100,150; 110,130; 100,150"
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