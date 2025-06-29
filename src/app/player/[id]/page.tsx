'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import VideoPlayer from '@/components/VideoPlayer'
import { HiArrowLeft, HiDownload } from 'react-icons/hi'
import { getFullApiUrl } from '@/config/env.config'

interface FileInfo {
  url: string
  publicUrl: string
  name: string
  type: string
}

export default function PlayerPage() {
  const params = useParams()
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        const response = await fetch(getFullApiUrl(`sharepoint/file/${params.id}`))
        if (!response.ok) throw new Error('Failed to fetch file info')
        const data = await response.json()
        setFileInfo(data)
      } catch (error) {
        console.error('Error fetching file info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchFileInfo()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!fileInfo) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="text-white text-xl">File không tồn tại hoặc đã bị xóa</div>
      </div>
    )
  }

  const mediaType = fileInfo.type.startsWith('audio/') ? 'audio' : 'video'

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center text-white hover:text-emerald-500 transition-colors"
        >
          <HiArrowLeft className="w-6 h-6 mr-2" />
          Quay lại
        </button>
        <h1 className="text-white text-xl font-medium flex-1 mx-4 truncate">
          {fileInfo.name}
        </h1>
        <a
          href={fileInfo.publicUrl}
          download={fileInfo.name}
          className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <HiDownload className="w-5 h-5 mr-2" />
          Tải xuống
        </a>
      </div>

      {/* Player */}
      <div className="flex-1 flex items-center justify-center">
        <VideoPlayer
          url={fileInfo.url}
          type={mediaType}
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
            }
          }}
        />
      </div>
    </div>
  )
} 