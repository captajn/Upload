'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { FiX, FiCopy, FiCheck, FiImage, FiFileText, FiMusic, FiVideo } from 'react-icons/fi'
import { Card } from './ui/card'
import { Progress } from './ui/progress'
import { FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { getFullApiUrl } from '@/config/env.config'
import { FOLDERS, BLOCKED_EXTENSIONS, BLOCKED_MIME_TYPES } from '@/config/constants'

// Thêm type definitions
interface UploadedFile {
  url: string
  publicUrl?: string
  name: string
  itemId: string
  driveId?: string
  type: string
  size: number
  folder: string
}

interface UploadProgress {
  fileName: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
  type: string
  size: number
  folder: string
}

interface CopyStatus {
  id: string
  status: 'copied' | 'error'
}

// Thêm hàm kiểm tra file có an toàn không
const isFileSafe = async (file: File): Promise<boolean> => {
  // Kiểm tra extension
  const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return false
  }

  // Kiểm tra MIME type
  if (BLOCKED_MIME_TYPES.includes(file.type)) {
    return false
  }

  // Kiểm tra magic numbers của file (16 bytes đầu tiên)
  return new Promise<boolean>((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 16)
      const header = Array.from(arr).map(byte => byte.toString(16).padStart(2, '0')).join('')
      
      // Danh sách magic numbers của các file thực thi
      const dangerousHeaders = [
        'MZ', // DOS MZ executable
        '7F454C46', // ELF
        '504B0304', // ZIP (có thể chứa file độc hại)
        '#!/', // Shebang của script
        '<?php', // PHP script
        '<%', // ASP script
      ]

      const isDangerous = dangerousHeaders.some(dHeader => 
        header.toLowerCase().startsWith(dHeader.toLowerCase())
      )
      
      resolve(!isDangerous)
    }
    reader.readAsArrayBuffer(file.slice(0, 16))
  })
}

// Thêm hàm sanitize tên file
const sanitizeFileName = (fileName: string): string => {
  // Loại bỏ các ký tự đặc biệt và dấu cách
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Thay thế ký tự đặc biệt bằng dấu _
    .replace(/\.{2,}/g, '.') // Ngăn chặn path traversal
    .replace(/\s+/g, '_') // Thay thế dấu cách bằng dấu _
}

// Component để preview video/audio
const MediaPreview: React.FC<{
  url: string
  type: string
  className?: string
  title?: string
  itemId: string
  driveId?: string
}> = ({ url, type, className, title, itemId, driveId }) => {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const playerRef = useRef<HTMLDivElement>(null)
  const artRef = useRef<Artplayer | null>(null)

  useEffect(() => {
    let mounted = true
    // Lưu trữ tham chiếu khi effect chạy
    const container = playerRef.current

    if (isHovered && type.startsWith('video/') && driveId && container) {
      // Tạo proxy URL cho video preview
      const protocol = window.location.protocol
      const host = window.location.host
      const baseUrl = `${protocol}//${host}`
      const proxyUrl = `${baseUrl}/api/sharepoint?proxy-file=${driveId}/${itemId}/${title}`

      // Chỉ tạo player nếu component vẫn mounted
      import('artplayer').then(({ default: ArtPlayer }) => {
        if (!mounted || !container || artRef.current) return

        try {
          artRef.current = new ArtPlayer({
            container,
            url: proxyUrl,
            volume: 0,
            muted: true,
            autoplay: false,
            autoSize: false,
            autoMini: false,
            loop: true,
            flip: true,
            playbackRate: true,
            aspectRatio: true,
            setting: true,
            hotkey: true,
            pip: true,
            theme: '#10b981',
            poster: url,
            moreVideoAttr: {
              playsInline: true,
              preload: 'none',
              crossOrigin: 'anonymous'
            }
          })
        } catch (error) {
          console.error('Error initializing video player:', error)
        }
      })
    }

    return () => {
      mounted = false
      const player = artRef.current
      
      if (player && container) {
        try {
          player.destroy()
          container.innerHTML = ''
        } catch (error) {
          console.error('Error destroying video player:', error)
        }
        artRef.current = null
      }
    }
  }, [isHovered, url, type, driveId, itemId, title])

  return (
    <div 
      className={`${className} relative group cursor-pointer`}
      onClick={() => {
        if (type.startsWith('video/')) {
          router.push(`/video/${itemId}`)
        } else if (type.startsWith('audio/')) {
          router.push(`/player/${itemId}`)
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        // Cleanup player khi mouse leave
        const player = artRef.current
        const container = playerRef.current
        
        if (player && container) {
          try {
            player.destroy()
            container.innerHTML = ''
          } catch (error) {
            console.error('Error destroying video player:', error)
          }
          artRef.current = null
        }
      }}
    >
      <div className="w-full h-full bg-black">
        {type.startsWith('audio/') ? (
          // Audio preview
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <FiMusic className="w-16 h-16 text-emerald-500" />
          </div>
        ) : (
          // Video preview với thumbnail và preview khi hover
          <div className="w-full h-full relative">
            {isHovered ? (
              <div ref={playerRef} className="w-full h-full" />
            ) : (
              <div className="w-full h-full relative">
                <Image
                  src={url}
                  alt={title || 'Video preview'}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0.8, scale: 0.8 }}
                    animate={{ 
                      opacity: [0.8, 1, 0.8],
                      scale: [0.8, 0.85, 0.8]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-16 h-16 rounded-full bg-emerald-500/80 flex items-center justify-center"
                  >
                    <FiVideo className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Overlay khi hover */}
      <motion.div 
        className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      >
        <motion.span 
          className="bg-white/90 text-gray-800 px-4 py-2 rounded-lg font-medium"
          initial={{ y: 10, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
        >
          {type.startsWith('video/') ? 'Xem video' : 'Nghe nhạc'}
        </motion.span>
      </motion.div>
    </div>
  )
}

// Component để preview document
const DocumentPreview: React.FC<{
  url: string
  type: string
  className?: string
}> = ({ url, type, className }) => {
  if (type.includes('pdf')) {
    return (
      <div className={`${className} relative`}>
        <iframe 
          src={`${url}#view=FitH`}
          className="w-full h-full absolute inset-0"
          title="PDF Preview"
        />
        <a 
          href={url}
          download
          className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Tải xuống PDF
        </a>
      </div>
    )
  }

  if (type.includes('word') || type.includes('document')) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800`}>
        <FaFileWord className="w-16 h-16 text-blue-500" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Tài liệu Word</p>
        <a 
          href={url}
          download
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Tải xuống
        </a>
      </div>
    )
  }

  if (type.includes('excel') || type.includes('spreadsheet')) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800`}>
        <FaFileExcel className="w-16 h-16 text-green-500" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Bảng tính Excel</p>
        <a 
          href={url}
          download
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          Tải xuống
        </a>
      </div>
    )
  }

  if (type.includes('powerpoint') || type.includes('presentation')) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800`}>
        <FaFilePowerpoint className="w-16 h-16 text-red-500" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Bài trình bày PowerPoint</p>
        <a 
          href={url}
          download
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Tải xuống
        </a>
      </div>
    )
  }

  // Cho các file khác
  return (
    <div className={`${className} flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800`}>
      <FileTypeIcon type={type} size="large" />
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{type.split('/')[1].toUpperCase()}</p>
      <a 
        href={url}
        download
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
      >
        Tải xuống
      </a>
    </div>
  )
}

// Thêm component ImagePreview
const ImagePreview: React.FC<{
  url: string
  title?: string
  onClose: () => void
}> = ({ url, title, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="relative w-full h-full max-w-5xl max-h-[90vh] m-4">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <div className="w-full h-full relative">
          <Image
            src={url}
            alt={title || 'Image preview'}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      </div>
    </div>
  )
}

const FileTypeIcon = ({ type, size = 'normal' }: { type: string, size?: 'normal' | 'large' }) => {
  const iconClass = size === 'large' ? 'w-16 h-16' : 'w-8 h-8'
  const iconColor = 'text-gray-400 dark:text-gray-500'

  if (type.startsWith('image/')) return <FiImage className={`${iconClass} ${iconColor}`} />
  if (type.includes('pdf')) return <FaFilePdf className={`${iconClass} ${iconColor}`} />
  if (type.includes('word')) return <FaFileWord className={`${iconClass} ${iconColor}`} />
  if (type.includes('excel') || type.includes('spreadsheet')) return <FaFileExcel className={`${iconClass} ${iconColor}`} />
  if (type.includes('powerpoint') || type.includes('presentation')) return <FaFilePowerpoint className={`${iconClass} ${iconColor}`} />
  if (type.includes('zip') || type.includes('compressed')) return <FaFileArchive className={`${iconClass} ${iconColor}`} />
  return <FiFileText className={`${iconClass} ${iconColor}`} />
}

export default function FileUploader() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>('Files')
  const [objectUrls, setObjectUrls] = useState<string[]>([])
  const [copyStatus, setCopyStatus] = useState<CopyStatus | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewImage, setPreviewImage] = useState<{url: string, title?: string} | null>(null)

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Kiểm tra an toàn trước khi upload
    const isSafe = await isFileSafe(file)
    if (!isSafe) {
      alert(`File ${file.name} không được phép upload do có thể chứa mã độc`)
      return
    }

    // Tự động phân loại file dựa vào mime type và extension
    const fileType = getFileType(file)
    const targetFolder = FOLDERS.find(f => f.id === fileType) || FOLDERS.find(f => f.id === 'Files')
    
    if (targetFolder) {
      setSelectedFolder(targetFolder.id)
      setSelectedType(targetFolder.id)

      // Chuẩn bị file để upload
      const validFiles = [file]
      setSelectedFiles(validFiles)
      
      const urls = validFiles.map(f => URL.createObjectURL(f))
      setObjectUrls(prev => {
        prev.forEach(url => URL.revokeObjectURL(url))
        return urls
      })

      setUploadProgress(validFiles.map(f => ({
        fileName: sanitizeFileName(f.name),
        progress: 0,
        status: 'uploading',
        type: f.type,
        size: f.size,
        folder: targetFolder.id
      })))
    }
  }, [])

  const getFileType = (file: File): string => {
    const mimeType = file.type.toLowerCase()
    
    // Kiểm tra mime type trước
    for (const folder of FOLDERS) {
      if (folder.acceptedTypes.includes(mimeType)) {
        return folder.id
      }
    }
    
    // Kiểm tra extension nếu không match được mime type
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (extension) {
      // Map extension to folder
      const extensionMap: Record<string, string> = {
        // Images
        'png': 'Images', 'jpg': 'Images', 'jpeg': 'Images', 'gif': 'Images', 'webp': 'Images', 'svg': 'Images',
        // Documents
        'pdf': 'Docs', 'doc': 'Docs', 'docx': 'Docs', 'xls': 'Docs', 'xlsx': 'Docs', 
        'ppt': 'Docs', 'pptx': 'Docs', 'txt': 'Docs',
        // Video
        'mp4': 'Video', 'webm': 'Video', 'mkv': 'Video', 'avi': 'Video', 'mov': 'Video',
        // Audio
        'mp3': 'Audio', 'wav': 'Audio', 'ogg': 'Audio', 'm4a': 'Audio', 'flac': 'Audio',
        // Archives
        'zip': 'Files', 'rar': 'Files', '7z': 'Files', 'tar': 'Files', 'gz': 'Files'
      }
      
      if (extension in extensionMap) {
        return extensionMap[extension]
      }
    }
    
    return 'Files' // Default folder
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const updateProgress = (index: number, progress: number) => {
    setUploadProgress(prev => prev.map((item, i) => 
      i === index ? { ...item, progress } : item
    ))
  }

  const handleUpload = async (file: File, index: number) => {
    try {
      updateProgress(index, 10)
      
      // Upload file lên SharePoint với thông tin folder và user
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', selectedFolder)
      
      const response = await fetch(getFullApiUrl('sharepoint?upload=true'), {
        method: 'POST',
        body: formData,
      })

      updateProgress(index, 50)

      if (!response.ok) {
        const error = await response.text()
        setUploadProgress(prev => prev.map((item, i) => 
          i === index ? { ...item, status: 'error', error } : item
        ))
        return
      }

      const data = await response.json()
      console.log('Upload response:', data)
      
      if (!data.itemId) {
        setUploadProgress(prev => prev.map((item, i) => 
          i === index ? { ...item, status: 'error', error: 'Missing itemId in response' } : item
        ))
        return
      }

      updateProgress(index, 75)

      // Tạo proxy URL
      const linkRes = await fetch(getFullApiUrl('sharepoint?create-link=true'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemId: data.itemId,
          driveId: data.driveId
        })
      })

      if (!linkRes.ok) {
        const error = await linkRes.text()
        setUploadProgress(prev => prev.map((item, i) => 
          i === index ? { ...item, status: 'error', error } : item
        ))
        return
      }

      const { publicUrl } = await linkRes.json()

      // Thêm file mới vào danh sách
      const newFile: UploadedFile = {
        url: data.url,
        publicUrl,
        name: file.name,
        itemId: data.itemId,
        driveId: data.driveId,
        type: file.type,
        size: file.size,
        folder: selectedFolder
      }

      setUploadedFiles(prev => [...prev, newFile])
      
      // Cập nhật trạng thái thành công
      setUploadProgress(prev => prev.map((item, i) => 
        i === index ? { ...item, progress: 100, status: 'success' } : item
      ))

    } catch (error) {
      console.error('Upload error:', error)
      setUploadProgress(prev => prev.map((item, i) => 
        i === index ? { 
          ...item, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error'
        } : item
      ))
    }
  }

  const handleUploadAll = async () => {
    setIsUploading(true)
    try {
      await Promise.all(selectedFiles.map((file, index) => handleUpload(file, index)))
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove))
    setUploadProgress(prev => prev.filter((_, index) => index !== indexToRemove))
    
    // Revoke object URL khi xóa file
    if (objectUrls[indexToRemove]) {
      URL.revokeObjectURL(objectUrls[indexToRemove])
      setObjectUrls(prev => prev.filter((_, index) => index !== indexToRemove))
    }
  }

  const handleRemoveAllFiles = () => {
    setSelectedFiles([])
    setUploadProgress([])
    
    // Revoke tất cả object URLs
    objectUrls.forEach(url => URL.revokeObjectURL(url))
    setObjectUrls([])
  }

  const handleCopyUrl = async (file: UploadedFile) => {
    try {
      await navigator.clipboard.writeText(file.publicUrl || file.url)
      setCopyStatus({id: file.itemId, status: 'copied'})
      setTimeout(() => setCopyStatus(null), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      setCopyStatus({id: file.itemId, status: 'error'})
      setTimeout(() => setCopyStatus(null), 2000)
    }
  }

  // Clean up object URLs khi component unmount
  useEffect(() => {
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [objectUrls])

  return (
    <div className="space-y-6">
      {/* File Type Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {FOLDERS.map((folder) => {
          return (
            <motion.button
              key={folder.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedType(folder.id)}
              className={`p-4 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors duration-200
                ${selectedType === folder.id
                  ? 'bg-emerald-50 border-2 border-emerald-500 dark:bg-emerald-900/20 dark:border-emerald-400'
                  : 'bg-white border-2 border-gray-200 hover:border-emerald-500 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-emerald-400'
                }`}
            >
              {folder.icon}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{folder.name}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Upload Area */}
      <motion.div
        initial={false}
        animate={{ borderColor: isDragging ? '#10b981' : '#e5e7eb' }}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center
          ${isDragging ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}
        `}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => handleFileSelect(e.target.files)}
          accept={selectedType ? FOLDERS.find(f => f.id === selectedType)?.acceptedTypes.join(',') : undefined}
        />
        <div className="space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            {selectedType ? (
              <>
                Upload vào {FOLDERS.find(f => f.id === selectedType)?.name}
                <br />
                <span className="text-sm">{FOLDERS.find(f => f.id === selectedType)?.description}</span>
              </>
            ) : (
              'Chọn loại file bạn muốn tải lên'
            )}
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-200">
            Chọn file
          </button>
        </div>
      </motion.div>

      {/* Selected Files */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                File đã chọn ({selectedFiles.length})
              </h3>
              <div className="space-x-2">
                <button
                  onClick={handleUploadAll}
                  disabled={isUploading}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'Đang tải lên...' : 'Tải lên tất cả'}
                </button>
                <button
                  onClick={handleRemoveAllFiles}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>

            {/* File List */}
            <div className="space-y-3">
              {selectedFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 flex items-center space-x-4"
                >
                  <div className="w-12 h-12 relative rounded overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {file.type.startsWith('image/') ? (
                      <Image
                        src={objectUrls[index]}
                        alt={file.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <FileTypeIcon type={file.type} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <div className="mt-1 relative pt-1">
                      <Progress 
                        value={uploadProgress[index]?.progress || 0}
                        indicatorColor={
                          uploadProgress[index]?.status === 'error' 
                            ? 'bg-red-500' 
                            : uploadProgress[index]?.status === 'success'
                            ? 'bg-emerald-500'
                            : 'bg-blue-500'
                        }
                      />
                    </div>
                    {uploadProgress[index]?.error && (
                      <p className="text-xs text-red-500 mt-1">
                        {uploadProgress[index].error}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Files */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              File đã tải lên ({uploadedFiles.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="overflow-hidden bg-white dark:bg-gray-800 h-full flex flex-col">
                    <div className="relative h-48 bg-gray-100 dark:bg-gray-700 group">
                      {file.type?.startsWith('image/') ? (
                        <>
                          <Image 
                            src={file.publicUrl || file.url} 
                            alt={file.name}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setPreviewImage({ url: file.publicUrl || file.url, title: file.name })}
                              className="bg-white/80 text-gray-800 p-2 rounded-full"
                            >
                              <FiImage className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </>
                      ) : file.type?.startsWith('video/') || file.type?.startsWith('audio/') ? (
                        <MediaPreview
                          url={file.url}
                          type={file.type}
                          className="w-full h-full"
                          title={file.name}
                          itemId={file.itemId}
                          driveId={file.driveId}
                        />
                      ) : file.type?.includes('pdf') || file.type?.includes('office') ? (
                        <DocumentPreview
                          url={file.publicUrl || file.url}
                          type={file.type}
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileTypeIcon type={file.type} size="large" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <div className="mt-auto">
                        <button
                          onClick={() => handleCopyUrl(file)}
                          className={`w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-sm transition-colors ${
                            copyStatus?.id === file.itemId && copyStatus?.status === 'copied'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                          }`}
                        >
                          {copyStatus?.id === file.itemId && copyStatus?.status === 'copied' ? (
                            <>
                              <FiCheck className="w-4 h-4" />
                              <span>Đã sao chép</span>
                            </>
                          ) : (
                            <>
                              <FiCopy className="w-4 h-4" />
                              <span>Sao chép URL</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy Status Toast */}
      <AnimatePresence>
        {copyStatus && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            {copyStatus.status === 'copied' ? 'URL đã được sao chép!' : 'Không thể sao chép URL'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <ImagePreview
            url={previewImage.url}
            title={previewImage.title}
            onClose={() => setPreviewImage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper functions
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
} 