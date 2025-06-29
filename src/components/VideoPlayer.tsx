'use client'

import { useEffect, useRef } from 'react'
import Artplayer from 'artplayer'
import type { Option } from 'artplayer/types/option'

// Thêm style cơ bản cho player
const playerStyle = `
.art-video-player {
  width: 100%;
  height: 100%;
  background-color: #000;
  position: relative;
}
.art-video-player video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.art-video-player .art-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  padding: 10px;
}
.art-video-player .art-controls button {
  color: white;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 5px;
  margin: 0 5px;
}
.art-video-player .art-controls button:hover {
  opacity: 0.8;
}
`

export interface VideoPlayerProps {
  url: string
  type: 'video' | 'audio'
  className?: string
  options?: Partial<Option>
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, type, className, options }) => {
  const artRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Artplayer | null>(null)

  useEffect(() => {
    // Thêm style vào document nếu chưa có
    if (!document.getElementById('art-player-style')) {
      const styleElement = document.createElement('style')
      styleElement.id = 'art-player-style'
      styleElement.textContent = playerStyle
      document.head.appendChild(styleElement)
    }

    const container = artRef.current
    if (!container) return

    const defaultOptions: Option = {
      container,
      url,
      type,
      volume: 0.5,
      autoplay: false,
      pip: true,
      autoSize: true,
      autoMini: true,
      setting: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      theme: '#10b981',
      hotkey: true,
      lock: true,
      fastForward: true,
      lang: 'vi-VN',
      moreVideoAttr: {
        crossOrigin: 'anonymous',
      },
    }

    // Merge default options với custom options
    const mergedOptions: Option = {
      ...defaultOptions,
      ...options
    }

    playerRef.current = new Artplayer(mergedOptions)

    playerRef.current.on('ready', () => {
      console.log('Player is ready')
    })

    playerRef.current.on('error', (error) => {
      console.error('Player error:', error)
    })

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
      // Xóa style khi component unmount
      const styleElement = document.getElementById('art-player-style')
      if (styleElement) {
        styleElement.remove()
      }
    }
  }, [url, type, options])

  return <div ref={artRef} className={className} />
}

export default VideoPlayer 