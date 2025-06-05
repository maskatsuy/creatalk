interface AudioLevelIndicatorProps {
  audioLevel: number
  audioEnabled: boolean
}

export function AudioLevelIndicator({ audioLevel, audioEnabled }: AudioLevelIndicatorProps) {
  if (!audioEnabled) return null

  return (
    <div className="mt-2">
      <div className="flex items-center justify-center gap-1">
        {[...Array(5)].map((_, i) => {
          const threshold = (i + 1) * 20
          const isActive = audioLevel >= threshold
          return (
            <div
              key={i}
              className={`h-3 w-1 rounded-full transition-all duration-100 ${
                isActive
                  ? audioLevel > 60
                    ? 'bg-green-500'
                    : audioLevel > 30
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              style={{
                height: `${12 + i * 3}px`,
                opacity: isActive ? 1 : 0.3
              }}
            />
          )
        })}
      </div>
      <div className="text-xs text-muted-foreground text-center mt-1">
        {audioLevel > 10 ? 'マイクが音声を検出中' : 'マイクに向かって話してください'}
      </div>
    </div>
  )
}