'use client'

import { useEffect, useRef, useState } from 'react'
import Artplayer from 'artplayer'
import type { Option } from 'artplayer/types/option'

// Thêm style cơ bản cho player
const playerStyle = `
.art-video-player {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.art-video-player .art-video {
  width: 100%;
  height: 100%;
  background-color: #000;
  cursor: pointer;
  object-fit: contain;
  position: relative;
  z-index: 2;
}

.art-video-player .art-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  z-index: 10;
  transition: opacity 0.3s;
}

.art-video-player .art-progress {
  position: absolute;
  bottom: 50px;
  left: 0;
  right: 0;
  height: 20px; /* Tăng chiều cao vùng có thể click */
  cursor: pointer;
  z-index: 20;
}

.art-video-player .art-progress-loaded,
.art-video-player .art-progress-played,
.art-video-player .art-progress-highlight {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 3px;
  width: 100%;
  background: rgba(255, 255, 255, 0.2);
  z-index: 0;
  pointer-events: none;
}

.art-video-player .art-progress:hover .art-progress-loaded,
.art-video-player .art-progress:hover .art-progress-played,
.art-video-player .art-progress:hover .art-progress-highlight {
  height: 5px;
  transition: all 0.2s;
}

.art-video-player .art-progress-played {
  background: #10b981;
  z-index: 1;
}

.art-video-player .art-progress-highlight {
  background: rgba(255, 255, 255, 0.4);
  z-index: 2;
}

.art-video-player .art-progress-thumb {
  display: none;
  position: absolute;
  top: 50%;
  right: -6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #10b981;
  transform: translateY(-50%);
  z-index: 3;
}

.art-video-player .art-progress:hover .art-progress-thumb {
  display: block;
}

.art-video-player .art-progress-time {
  display: none;
  position: absolute;
  top: -25px;
  left: 0;
  padding: 5px 8px;
  color: #fff;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  z-index: 4;
}

.art-video-player .art-progress:hover .art-progress-time {
  display: block;
}

.art-bottom {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.art-controls-left,
.art-controls-right {
  display: flex;
  align-items: center;
  height: 100%;
}

.art-controls button {
  color: #fff;
  background: transparent;
  border: none;
  outline: none;
  padding: 8px;
  margin: 0;
  opacity: 0.9;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.art-controls button:hover {
  opacity: 1;
}

.art-volume-panel {
  position: relative;
  z-index: 30;
}

.art-settings-panel {
  position: absolute;
  bottom: 60px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  padding: 10px;
  z-index: 40;
}

.art-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
}
`

export interface VideoPlayerProps {
  url: string
  type: 'video' | 'audio' | 'hls'
  className?: string
  options?: Partial<Option>
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, type, className, options }) => {
  const artRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Artplayer | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Kiểm tra type hợp lệ
    if (type !== 'video' && type !== 'audio' && type !== 'hls') {
      setError('Không hỗ trợ định dạng file này')
      return
    }

    // Thêm style vào document nếu chưa có
    if (!document.getElementById('art-player-style')) {
      const styleElement = document.createElement('style')
      styleElement.id = 'art-player-style'
      styleElement.textContent = playerStyle
      document.head.appendChild(styleElement)
    }

    const container = artRef.current
    if (!container) return

    // Cleanup trước khi tạo player mới
    if (playerRef.current) {
      try {
        playerRef.current.destroy()
        container.innerHTML = ''
      } catch (error) {
        console.error('Error cleaning up player:', error)
      }
      playerRef.current = null
    }

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

    try {
      playerRef.current = new Artplayer(mergedOptions)

      playerRef.current.on('ready', () => {
        console.log('Player is ready')
        setError(null)
      })

      playerRef.current.on('error', (error) => {
        console.error('Player error:', error)
        setError('Không thể phát file này')
      })
    } catch (error) {
      console.error('Error initializing player:', error)
      setError('Không thể khởi tạo player')
    }

    return () => {
      if (playerRef.current && container) {
        try {
          playerRef.current.destroy()
          container.innerHTML = ''
        } catch (error) {
          console.error('Error destroying player:', error)
        }
        playerRef.current = null
      }
      // Xóa style khi component unmount
      const styleElement = document.getElementById('art-player-style')
      if (styleElement) {
        styleElement.remove()
      }
    }
  }, [url, type, options])

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-black text-white`}>
        <div className="text-center">
          <p className="text-red-500 mb-2">⚠️</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return <div ref={artRef} className={className} />
}

export default VideoPlayer 