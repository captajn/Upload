'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { FiX, FiCopy, FiCheck, FiImage, FiFileText, FiFolder, FiMusic, FiVideo } from 'react-icons/fi'
import { Card } from './ui/card'
import { Progress } from './ui/progress'
import { FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { getFullApiUrl } from '@/config/env.config'

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

interface FolderConfig {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  acceptedTypes: string[]
  maxFileSize?: number // Giới hạn kích thước riêng cho từng folder (nếu không set sẽ dùng MAX_FILE_SIZE)
  requireAuth?: boolean // Yêu cầu xác thực để upload vào folder này
}

// Cấu hình folders
const FOLDERS: FolderConfig[] = [
  {
    id: 'Images',
    name: 'Images',
    description: 'Ảnh: PNG, JPG, JPEG, GIF, WEBP, SVG',
    icon: <FiImage className="w-6 h-6" />,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  },
  {
    id: 'Docs',
    name: 'Documents',
    description: 'Tài liệu: PDF, Word, Excel, PowerPoint, Text',
    icon: <FiFileText className="w-6 h-6" />,
    acceptedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ]
  },
  {
    id: 'Video',
    name: 'Video',
    description: 'Video: MP4, WebM, MKV, AVI, MOV',
    icon: <FiVideo className="w-6 h-6" />,
    acceptedTypes: ['video/mp4', 'video/webm', 'video/x-matroska', 'video/avi', 'video/quicktime']
  },
  {
    id: 'Audio',
    name: 'Audio',
    description: 'Âm thanh: MP3, WAV, OGG, M4A, FLAC',
    icon: <FiMusic className="w-6 h-6" />,
    acceptedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/flac']
  },
  {
    id: 'Files',
    name: 'Files',
    description: 'Các loại file khác (CAD, code, etc)',
    icon: <FiFolder className="w-6 h-6" />,
    acceptedTypes: ['*/*']
  }
]

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB mặc định

// Thêm danh sách các file extension nguy hiểm cần chặn
const BLOCKED_EXTENSIONS = [
  // Shell scripts
  '.sh', '.bash', '.ksh', '.csh', '.zsh', '.fish',
  // Windows scripts
  '.bat', '.cmd', '.ps1', '.psm1', '.vbs', '.vbe', '.js', '.jse', '.wsf', '.wsh',
  // PHP scripts
  '.php', '.php3', '.php4', '.php5', '.phtml',
  // Other dangerous files
  '.exe', '.msi', '.dll', '.bin', '.iso',
  // Potential web shells
  '.asp', '.aspx', '.jsp', '.jspx', '.cgi', '.pl', '.py',
  // Config files that có thể chứa thông tin nhạy cảm
  '.env', '.config', '.ini', '.conf'
]

// Thêm danh sách MIME types nguy hiểm
const BLOCKED_MIME_TYPES = [
  'application/x-msdownload',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-msdos-program',
  'application/x-msi',
  'application/x-python-code',
  'application/x-perl',
  'application/x-ruby',
  'application/x-sh',
  'application/x-shellscript',
  'text/x-php',
  'text/x-script',
  'text/javascript'
]

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
}> = ({ url, type, className, title, itemId }) => {
  const router = useRouter()

  return (
    <div 
      className={`${className} relative group cursor-pointer`}
      onClick={() => router.push(`/player/${itemId}`)}
    >
      <div className="w-full h-full bg-black">
        {type.startsWith('audio/') ? (
          // Audio preview
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <FiMusic className="w-16 h-16 text-emerald-500" />
          </div>
        ) : (
          // Video preview - chỉ hiển thị thumbnail
          <div className="w-full h-full relative">
            <Image
              src={`${url}&thumbnail=true`}
              alt={title || 'Video preview'}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        )}
      </div>
      
      {/* Overlay khi hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <span className="bg-white/80 text-gray-800 px-4 py-2 rounded-lg">
          Xem phóng to
        </span>
      </div>
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

const FileUploader: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>('Files')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [objectUrls, setObjectUrls] = useState<string[]>([])
  const [copyStatus, setCopyStatus] = useState<CopyStatus | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const currentFolder = FOLDERS.find(f => f.id === selectedFolder) || FOLDERS[FOLDERS.length - 1]

  // Thêm hàm helper để tự động detect folder dựa vào file type
  const detectFileFolder = (fileType: string): string => {
    // Kiểm tra từng folder và các accepted types
    for (const folder of FOLDERS) {
      if (folder.id === 'others') continue // Bỏ qua folder others
      
      const isAccepted = folder.acceptedTypes.some(type => {
        if (type === fileType) return true
        // Kiểm tra wildcard match (e.g. image/* matches image/png)
        if (type.endsWith('/*')) {
          const typePrefix = type.split('/')[0]
          return fileType.startsWith(typePrefix + '/')
        }
        return false
      })
      
      if (isAccepted) return folder.id
    }
    
    return 'others' // Mặc định là others nếu không match với folder nào
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      
      // Kiểm tra an toàn cho từng file
      Promise.all(files.map(async file => {
        const isSafe = await isFileSafe(file)
        if (!isSafe) {
          alert(`File ${file.name} không được phép upload do có thể chứa mã độc`)
          return null
        }
        return file
      })).then(checkedFiles => {
        const validFiles = checkedFiles.filter((file): file is File => 
          file !== null && 
          (!currentFolder?.acceptedTypes[0] || 
           currentFolder.acceptedTypes[0] === '*/*' ||
           currentFolder.acceptedTypes.includes(file.type))
        )

        if (validFiles.length === 0) {
          return
        }

        // Nếu chưa chọn folder, tự động detect folder cho file đầu tiên
        if (selectedFolder === 'Files' && validFiles.length > 0) {
          const detectedFolder = detectFileFolder(validFiles[0].type)
          setSelectedFolder(detectedFolder)
        }

        setSelectedFiles(validFiles)
        
        // Tạo và lưu trữ object URLs cho preview
        const urls = validFiles.map(file => URL.createObjectURL(file))
        setObjectUrls(prev => {
          prev.forEach(url => URL.revokeObjectURL(url))
          return urls
        })

        // Khởi tạo progress cho mỗi file với tên file đã được sanitize
        setUploadProgress(validFiles.map(file => ({
          fileName: sanitizeFileName(file.name),
          progress: 0,
          status: 'uploading',
          type: file.type,
          size: file.size,
          folder: selectedFolder
        })))
      })
    }
  }, [selectedFolder, currentFolder])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files)
      
      Promise.all(files.map(async file => {
        const isSafe = await isFileSafe(file)
        if (!isSafe) {
          alert(`File ${file.name} không được phép upload do có thể chứa mã độc`)
          return null
        }
        return file
      })).then(checkedFiles => {
        const validFiles = checkedFiles.filter((file): file is File => 
          file !== null &&
          (!currentFolder?.acceptedTypes[0] || 
           currentFolder.acceptedTypes[0] === '*/*' ||
           currentFolder.acceptedTypes.includes(file.type))
        )

        if (validFiles.length === 0) {
          return
        }

        setSelectedFiles(validFiles)
        
        const urls = validFiles.map(file => URL.createObjectURL(file))
        setObjectUrls(prev => {
          prev.forEach(url => URL.revokeObjectURL(url))
          return urls
        })

        setUploadProgress(validFiles.map(file => ({
          fileName: sanitizeFileName(file.name),
          progress: 0,
          status: 'uploading',
          type: file.type,
          size: file.size,
          folder: selectedFolder
        })))
      })
    }
  }, [selectedFolder, currentFolder])

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
    <div className="p-6 space-y-6">
      {/* Folder Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {FOLDERS.map(folder => (
          <motion.button
            key={folder.id}
            onClick={() => {
              setSelectedFolder(folder.id)
            }}
            className={`p-4 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
              selectedFolder === folder.id
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {folder.icon}
            <span className="text-sm font-medium">{folder.name}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {folder.description}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Upload Zone */}
      <motion.div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging 
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
            : 'border-gray-300 dark:border-gray-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept={currentFolder?.acceptedTypes.join(',') || '*/*'}
        />
        
        <motion.div 
          className="flex flex-col items-center justify-center space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div 
            className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center"
            animate={{ 
              scale: isDragging ? [1, 1.1, 1] : 1,
              rotate: isDragging ? [0, -5, 5, -5, 0] : 0
            }}
            transition={{ 
              duration: isDragging ? 0.5 : 0.2,
              repeat: isDragging ? Infinity : 0,
              repeatDelay: 0.5
            }}
          >
            {currentFolder.icon}
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isDragging ? 'Thả để tải lên' : `Upload vào ${currentFolder.name}`}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {currentFolder.description}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Tối đa {formatFileSize(currentFolder.maxFileSize || MAX_FILE_SIZE)} mỗi file
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Chọn file
          </button>
        </motion.div>
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
                        <Image 
                          src={file.publicUrl || file.url} 
                          alt={file.name}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      ) : file.type?.startsWith('video/') || file.type?.startsWith('audio/') ? (
                        <MediaPreview
                          url={file.publicUrl || file.url}
                          type={file.type}
                          className="w-full h-full"
                          title={file.name}
                          itemId={file.itemId}
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
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.open(file.publicUrl || file.url, '_blank')}
                          className="bg-white/80 text-gray-800 p-2 rounded-full"
                        >
                          <FiImage className="w-5 h-5" />
                        </motion.button>
                      </div>
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

export default FileUploader 