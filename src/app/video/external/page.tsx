'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import VideoPlayer from '@/components/VideoPlayer'
import { Button } from '@/components/ui/button'
import { HiVideoCamera, HiArrowLeft, HiPlus } from 'react-icons/hi'

function ExternalVideoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [isHLS, setIsHLS] = useState(false)

  useEffect(() => {
    const url = searchParams.get('url')
    if (!url) {
      return
    }

    try {
      const decodedUrl = decodeURIComponent(url)
      setVideoUrl(decodedUrl)
      setIsHLS(decodedUrl.includes('.m3u8'))
    } catch (error) {
      console.error('Error decoding URL:', error)
    }
  }, [searchParams])

  if (!videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto">
          <HiVideoCamera className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Chưa có link video
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vui lòng thêm link video vào URL hoặc quay lại trang danh sách để chọn video
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.push('/video')}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <HiArrowLeft className="w-5 h-5" />
              Quay lại danh sách
            </Button>
            <Button 
              onClick={() => router.push('/video?add=true')}
              className="flex items-center justify-center gap-2"
            >
              <HiPlus className="w-5 h-5" />
              Thêm Link Video
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <Button 
            onClick={() => router.push('/video')}
            variant="outline"
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <HiArrowLeft className="w-5 h-5" />
            Quay lại danh sách
          </Button>
          <Button 
            onClick={() => router.push('/video?add=true')}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <HiPlus className="w-5 h-5" />
            Thêm Link Video
          </Button>
        </div>
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-xl">
          <VideoPlayer
            url={videoUrl}
            type={isHLS ? 'hls' : 'video'}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  )
}

export default function ExternalVideoPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <ExternalVideoContent />
    </Suspense>
  )
} 