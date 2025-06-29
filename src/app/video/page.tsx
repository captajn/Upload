'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { HiPlay, HiPlus, HiTrash, HiExternalLink, HiClock, HiX } from 'react-icons/hi'
import { Button } from '@/components/ui/button'
import VideoPlayer from '@/components/VideoPlayer'

interface VideoHistory {
  id?: string
  url: string
  name: string
  type: string
  thumbnail?: string
  timestamp: number
  source: 'sharepoint' | 'external'
}

function VideoListContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [videoHistory, setVideoHistory] = useState<VideoHistory[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<VideoHistory | null>(null)

  // Kiểm tra nếu có query add=true thì hiển thị form
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddForm(true)
    }
  }, [searchParams])

  // Kiểm tra nếu có query url thì hiển thị video
  useEffect(() => {
    const url = searchParams.get('url')
    if (url) {
      try {
        const decodedUrl = decodeURIComponent(url)
        const isHLS = decodedUrl.includes('.m3u8')
        setCurrentVideo({
          url: decodedUrl,
          name: decodedUrl.split('/').pop() || 'External Video',
          type: isHLS ? 'application/x-mpegURL' : 'video/*',
          timestamp: Date.now(),
          source: 'external'
        })
      } catch (error) {
        console.error('Error decoding URL:', error)
      }
    }
  }, [searchParams])

  useEffect(() => {
    // Load video history from localStorage
    const savedHistory = localStorage.getItem('videoHistory')
    if (savedHistory) {
      setVideoHistory(JSON.parse(savedHistory))
    }
  }, [])

  const addToHistory = (video: VideoHistory) => {
    setVideoHistory(prev => {
      const newHistory = [video, ...prev.filter(v => v.url !== video.url)]
      localStorage.setItem('videoHistory', JSON.stringify(newHistory))
      return newHistory
    })
  }

  const handleExternalVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Basic validation
      if (!newVideoUrl.trim()) return

      // Check if URL is from SharePoint
      const isSharePoint = newVideoUrl.includes('sharepoint.com') || newVideoUrl.includes('/api/sharepoint')

      let videoInfo: VideoHistory

      if (isSharePoint) {
        // Extract ID from SharePoint URL and fetch info
        const id = newVideoUrl.split('/').pop()
        const response = await fetch(`/api/sharepoint/file/${id}`)
        const data = await response.json()
        
        videoInfo = {
          id: data.itemId,
          url: data.url,
          name: data.name,
          type: data.type,
          thumbnail: data.thumbnail,
          timestamp: Date.now(),
          source: 'sharepoint'
        }
      } else {
        // External video
        const isHLS = newVideoUrl.endsWith('.m3u8') || 
                     newVideoUrl.includes('index.m3u8') ||
                     newVideoUrl.includes('playlist.m3u8')
        
        videoInfo = {
          url: newVideoUrl,
          name: newVideoUrl.split('/').pop() || 'External Video',
          type: isHLS ? 'application/x-mpegURL' : 'video/*',
          timestamp: Date.now(),
          source: 'external'
        }
      }

      addToHistory(videoInfo)
      setNewVideoUrl('')
      setShowAddForm(false)
      // Chuyển đến xem video ngay
      setCurrentVideo(videoInfo)
    } catch (error) {
      console.error('Error adding video:', error)
      alert('Không thể thêm video. Vui lòng kiểm tra URL.')
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromHistory = (url: string) => {
    setVideoHistory(prev => {
      const newHistory = prev.filter(v => v.url !== url)
      localStorage.setItem('videoHistory', JSON.stringify(newHistory))
      return newHistory
    })
  }

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp)
  }

  // Nếu đang xem video
  if (currentVideo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <Button 
              onClick={() => {
                setCurrentVideo(null)
                router.push('/video')
              }}
              variant="outline"
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <HiX className="w-5 h-5" />
              Đóng video
            </Button>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <HiPlus className="w-5 h-5" />
              Thêm Link Video
            </Button>
          </div>
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-xl">
            <VideoPlayer
              url={currentVideo.url}
              type={currentVideo.type.includes('m3u8') ? 'hls' : 'video'}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Video của bạn
          </h1>
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <HiPlus className="w-5 h-5" />
            Thêm Video
          </Button>
        </div>

        {/* Add Video Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
            >
              <form onSubmit={handleExternalVideo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL Video (SharePoint hoặc URL khác)
                  </label>
                  <input
                    type="url"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="Nhập URL video..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setNewVideoUrl('')
                      router.push('/video')
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang xử lý...' : 'Thêm'}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {videoHistory.map((video, index) => (
              <motion.div
                key={video.url}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Thumbnail */}
                <div 
                  className="relative aspect-video bg-gray-900 cursor-pointer group"
                  onClick={() => setCurrentVideo(video)}
                >
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt={video.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <HiPlay className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                  
                  <motion.div
                    initial={false}
                    animate={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/50"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="w-16 h-16 rounded-full bg-emerald-500 bg-opacity-80 flex items-center justify-center"
                    >
                      <HiPlay className="w-8 h-8 text-white" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {video.name}
                  </h3>
                  <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <HiClock className="w-4 h-4 mr-1" />
                    <span>{formatDate(video.timestamp)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1
                      ${video.source === 'sharepoint' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}
                    >
                      {video.source === 'sharepoint' ? (
                        'SharePoint'
                      ) : (
                        <>
                          <HiExternalLink className="w-3 h-3" />
                          External
                        </>
                      )}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFromHistory(video.url)
                      }}
                      className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      aria-label="Xóa khỏi lịch sử"
                    >
                      <HiTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {videoHistory.length === 0 && !showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <HiPlay className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Chưa có video nào
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Thêm video từ SharePoint hoặc URL bên ngoài để bắt đầu
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <HiPlus className="w-5 h-5" />
              Thêm Video Đầu Tiên
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function VideoListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </div>
    }>
      <VideoListContent />
    </Suspense>
  )
} 