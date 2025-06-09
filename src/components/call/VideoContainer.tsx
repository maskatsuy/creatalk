'use client'

import { forwardRef } from 'react'

interface VideoContainerProps {
  showLoadingOverlay: boolean
}

export const VideoContainer = forwardRef<HTMLDivElement, VideoContainerProps>(
  ({ showLoadingOverlay }, ref) => {
    return (
      <div className="flex-1 relative bg-black">
        <div ref={ref} className="absolute inset-0 daily-video-container" />
        
        <style jsx global>{`
          .daily-video-container {
            width: 100% !important;
            height: 100% !important;
            position: relative !important;
            min-height: 80vh !important;
          }
          
          .daily-video-container iframe {
            width: 100% !important;
            height: 100% !important;
            min-height: 80vh !important;
            border: none !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
          }
        `}</style>
        
        {/* Loading overlay - always present but conditionally visible */}
        {showLoadingOverlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Daily.coに接続中...</p>
            </div>
          </div>
        )}
      </div>
    )
  }
)

VideoContainer.displayName = 'VideoContainer'