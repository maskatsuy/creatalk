// グローバルなメディアストリーム管理
class MediaStreamManager {
  private streams: Set<MediaStream> = new Set()
  
  addStream(stream: MediaStream) {
    this.streams.add(stream)
  }
  
  removeStream(stream: MediaStream) {
    this.streams.delete(stream)
  }
  
  stopStream(stream: MediaStream) {
    stream.getTracks().forEach(track => track.stop())
    this.removeStream(stream)
  }
  
  stopAllStreams() {
    this.streams.forEach(stream => {
      stream.getTracks().forEach(track => track.stop())
    })
    this.streams.clear()
  }
  
  getActiveStreams() {
    return Array.from(this.streams)
  }
}

export const mediaStreamManager = new MediaStreamManager()

// ページ離脱時にすべてのストリームを停止
if (typeof window !== 'undefined') {
  const cleanupStreams = () => {
    console.log('Cleaning up all media streams')
    mediaStreamManager.stopAllStreams()
  }
  
  window.addEventListener('beforeunload', cleanupStreams)
  window.addEventListener('pagehide', cleanupStreams)
  window.addEventListener('unload', cleanupStreams)
  
  // Next.js Router変更時もクリーンアップ
  let currentPath = window.location.pathname
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname
      console.log('Route changed, cleaning up streams')
      cleanupStreams()
    }
  })
  
  // DOM変更を監視してルート変更を検出
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}