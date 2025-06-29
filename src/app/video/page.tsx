'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { HiPlay, HiPlus, HiTrash, HiExternalLink, HiClock } from 'react-icons/hi'

interface VideoHistory {
  id?: string
  url: string
  name: string
  type: string
  thumbnail?: string
  timestamp: number
  source: 'sharepoint' | 'external'
}

export default function VideoListPage() {
  const router = useRouter()
  const [videoHistory, setVideoHistory] = useState<VideoHistory[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load video history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('videoHistory')
    if (history) {
      setVideoHistory(JSON.parse(history))
    }
  }, [])

  // Save to localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem('videoHistory', JSON.stringify(videoHistory))
  }, [videoHistory])

  const addToHistory = (video: VideoHistory) => {
    setVideoHistory(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(v => v.url !== video.url)
      // Add new video to start of array
      return [video, ...filtered].slice(0, 50) // Keep only last 50 videos
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
    } catch (error) {
      console.error('Error adding video:', error)
      alert('Không thể thêm video. Vui lòng kiểm tra URL.')
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromHistory = (url: string) => {
    setVideoHistory(prev => prev.filter(v => v.url !== url))
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Danh sách video
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <HiPlus className="w-5 h-5 mr-2" />
            <span>Thêm video</span>
          </motion.button>
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
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Đang xử lý...' : 'Thêm'}
                  </button>
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
                  onClick={() => router.push(video.source === 'sharepoint' ? `/video/${video.id}` : `/video/external?url=${encodeURIComponent(video.url)}`)}
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
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="w-16 h-16 rounded-full bg-emerald-500 bg-opacity-80 flex items-center justify-center"
                    >
                      <HiPlay className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>
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
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      {video.source === 'sharepoint' ? (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                          SharePoint
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded flex items-center">
                          <HiExternalLink className="w-3 h-3 mr-1" />
                          External
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromHistory(video.url)}
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
        {videoHistory.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <HiPlay className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Chưa có video nào
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Thêm video từ SharePoint hoặc URL bên ngoài để bắt đầu
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
} 