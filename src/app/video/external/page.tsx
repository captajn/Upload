'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import VideoPlayer from '@/components/VideoPlayer'
import { Button } from '@/components/ui/button'

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
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-red-500 mb-4">URL video không hợp lệ</p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="aspect-video w-full">
        <VideoPlayer
          url={videoUrl}
          type={isHLS ? 'hls' : 'video'}
          className="w-full h-full"
        />
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