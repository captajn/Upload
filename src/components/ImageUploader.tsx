'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { FiUpload, FiX, FiCopy, FiCheck, FiImage, FiFileText } from 'react-icons/fi'
import { Card } from './ui/card'
import { Progress } from './ui/progress'
import { FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive } from 'react-icons/fa'

// Thêm type definitions
interface UploadedImage {
  url: string
  publicUrl?: string
  name: string
  itemId: string
  driveId?: string
  type: string
  size: number
}

interface UploadProgress {
  fileName: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
  type: string
  size: number
}

interface CopyStatus {
  id: string
  status: 'copied' | 'error'
}

// Thêm các định dạng file được hỗ trợ
const SUPPORTED_FILE_TYPES = {
  'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  'spreadsheet': ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  'presentation': ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  'archive': ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
  'text': ['text/plain', 'text/csv', 'text/html', 'text/javascript', 'text/css']
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Đổi tên component
const FileUploader: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [objectUrls, setObjectUrls] = useState<string[]>([])
  const [copyStatus, setCopyStatus] = useState<CopyStatus | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      
      // Kiểm tra kích thước và định dạng file
      const validFiles = files.filter(file => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`File ${file.name} vượt quá kích thước cho phép (50MB)`)
          return false
        }
        
        const isSupported = Object.values(SUPPORTED_FILE_TYPES).flat().includes(file.type)
        if (!isSupported) {
          alert(`Định dạng file ${file.name} không được hỗ trợ`)
          return false
        }
        
        return true
      })

      setSelectedFiles(validFiles)
      
      // Tạo và lưu trữ object URLs cho preview
      const urls = validFiles.map(file => URL.createObjectURL(file))
      setObjectUrls(prev => {
        prev.forEach(url => URL.revokeObjectURL(url))
        return urls
      })

      // Khởi tạo progress cho mỗi file
      setUploadProgress(validFiles.map(file => ({
        fileName: file.name,
        progress: 0,
        status: 'uploading',
        type: file.type,
        size: file.size
      })))
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files)
      setSelectedFiles(files)
      
      // Tạo và lưu trữ object URLs
      const urls = files.map(file => URL.createObjectURL(file))
      setObjectUrls(prev => {
        // Revoke old URLs để tránh memory leak
        prev.forEach(url => URL.revokeObjectURL(url))
        return urls
      })

      // Khởi tạo progress cho mỗi file
      setUploadProgress(files.map(file => ({
        fileName: file.name,
        progress: 0,
        status: 'uploading',
        type: file.type,
        size: file.size
      })))
    }
  }, [])

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
      
      // Upload file lên SharePoint
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/sharepoint?upload=true', {
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
      const linkRes = await fetch('/api/sharepoint?create-link=true', {
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

      // Thêm ảnh mới vào danh sách
      const newImage: UploadedImage = {
        url: data.url,
        publicUrl,
        name: file.name,
        itemId: data.itemId,
        driveId: data.driveId,
        type: file.type,
        size: file.size
      }

      setUploadedImages(prev => [...prev, newImage])
      
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

  const handleCopyUrl = async (image: UploadedImage) => {
    try {
      await navigator.clipboard.writeText(image.publicUrl || image.url)
      setCopyStatus({id: image.itemId, status: 'copied'})
      setTimeout(() => setCopyStatus(null), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      setCopyStatus({id: image.itemId, status: 'error'})
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
          accept={Object.values(SUPPORTED_FILE_TYPES).flat().join(',')}
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
            <FiUpload className="w-8 h-8 text-emerald-500 dark:text-emerald-300" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isDragging ? 'Thả để tải lên' : 'Kéo thả hoặc chọn file'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Hỗ trợ nhiều định dạng: Ảnh, PDF, Word, Excel, PowerPoint, ZIP, Text...
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Tối đa 50MB mỗi file
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
        {uploadedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              File đã tải lên ({uploadedImages.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {uploadedImages.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="overflow-hidden bg-white dark:bg-gray-800 h-full flex flex-col">
                    <div className="relative h-48 bg-gray-100 dark:bg-gray-700 group">
                      {image.type?.startsWith('image/') ? (
                        <Image 
                          src={image.publicUrl || image.url} 
                          alt={image.name}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileTypeIcon type={image.type} size="large" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.open(image.publicUrl || image.url, '_blank')}
                          className="bg-white/80 text-gray-800 p-2 rounded-full"
                        >
                          <FiImage className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {image.name}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({formatFileSize(image.size)})
                        </span>
                      </div>
                      <div className="mt-auto">
                        <button
                          onClick={() => handleCopyUrl(image)}
                          className={`w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-sm transition-colors ${
                            copyStatus?.id === image.itemId && copyStatus?.status === 'copied'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                          }`}
                        >
                          {copyStatus?.id === image.itemId && copyStatus?.status === 'copied' ? (
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