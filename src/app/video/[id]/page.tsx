'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import VideoPlayer from '@/components/VideoPlayer'
import { HiArrowLeft, HiDownload } from 'react-icons/hi'
import { getFullApiUrl } from '@/config/env.config'

interface VideoInfo {
  url: string
  publicUrl: string
  name: string
  type: string
  isHLS?: boolean
}

interface VideoPageProps {
  params: { id: string }
}

function VideoPageContent({ params }: VideoPageProps) {
  const router = useRouter()
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    const fetchVideoInfo = async () => {
      try {
        const response = await fetch(getFullApiUrl(`video?id=${params.id}`))
        if (!response.ok) throw new Error('Failed to fetch video info')
        const data = await response.json()
        setVideoInfo(data)
      } catch (error) {
        console.error('Error fetching video info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchVideoInfo()
    }
  }, [params.id])

  // Auto hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchstart', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchstart', handleMouseMove)
      clearTimeout(timeout)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <motion.div
          className="w-16 h-16 border-4 border-emerald-500 rounded-full border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  if (!videoInfo) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-xl">Video không tồn tại hoặc đã bị xóa</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Video Player */}
      <div className="w-full h-full">
        <VideoPlayer
          url={videoInfo.url}
          type="video"
          className="w-full h-full"
          options={{
            autoSize: false,
            autoMini: false,
            fullscreen: true,
            playbackRate: true,
            aspectRatio: true,
            setting: true,
            hotkey: true,
            pip: true,
            theme: '#10b981',
            moreVideoAttr: {
              playsInline: true,
              preload: 'auto',
              autoplay: true
            },
            type: videoInfo.isHLS ? 'hls' : 'normal'
          }}
        />
      </div>

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <>
            {/* Top Controls */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.2 }}
              className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent"
            >
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.back()}
                  className="flex items-center text-white hover:text-emerald-500 transition-colors"
                >
                  <HiArrowLeft className="w-6 h-6 mr-2" />
                  <span className="hidden sm:inline">Quay lại</span>
                </motion.button>
                <h1 className="text-white text-lg sm:text-xl font-medium truncate mx-4">
                  {videoInfo.name}
                </h1>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={videoInfo.publicUrl}
                  download={videoInfo.name}
                  className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <HiDownload className="w-5 h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Tải xuống</span>
                </motion.a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function VideoPage({ params }: VideoPageProps) {
  return <VideoPageContent params={params} />
}