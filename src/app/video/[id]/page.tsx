'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVideoInfo = async () => {
      try {
        const response = await fetch(getFullApiUrl(`sharepoint/file/${params.id}`))
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch video info')
        }
        
        // Kiểm tra dữ liệu trả về
        if (!data.url) {
          throw new Error('Video URL not found')
        }

        // Kiểm tra type có phải là video không
        if (!data.type?.startsWith('video/')) {
          throw new Error('File này không phải là video')
        }
        
        setVideoInfo(data)
        setError(null)
      } catch (error) {
        console.error('Error fetching video info:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchVideoInfo()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <motion.div
              className="w-16 h-16 border-4 border-emerald-500 rounded-full border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (error || !videoInfo) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400 text-xl mb-4 text-center">
              <div className="mb-2">⚠️</div>
              {error || 'Video không tồn tại hoặc đã bị xóa'}
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center text-emerald-500 hover:text-emerald-600 transition-colors"
            >
              <HiArrowLeft className="w-5 h-5 mr-2" />
              Quay lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center text-gray-700 dark:text-gray-200 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
            aria-label="Quay lại trang trước"
          >
            <HiArrowLeft className="w-6 h-6" />
          </motion.button>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={videoInfo.publicUrl}
            download={videoInfo.name}
            className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <HiDownload className="w-5 h-5 mr-2" />
            <span>Tải xuống</span>
          </motion.a>
        </div>

        {/* Video Title */}
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {videoInfo.name}
        </h1>

        {/* Video Player */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <VideoPlayer
            url={videoInfo.url}
            type="video"
            className="w-full h-full"
            options={{
              url: videoInfo.url,
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
                preload: 'metadata',
                autoplay: false
              },
              type: videoInfo.isHLS ? 'hls' : 'normal'
            }}
          />
        </div>
      </div>
    </div>
  )
} 