import { useState, useCallback } from 'react'
import { getFullApiUrl } from '@/config/env.config'
import type { UploadedFile, UploadProgress } from '@/types'

interface UseFileUploadOptions {
  onProgress?: (fileName: string, progress: number) => void
  onSuccess?: (file: UploadedFile) => void
  onError?: (fileName: string, error: string) => void
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])

  const updateProgress = useCallback((index: number, progress: number) => {
    setUploadProgress(prev => prev.map((item, i) => 
      i === index ? { ...item, progress } : item
    ))
    if (options.onProgress) {
      options.onProgress(uploadProgress[index].fileName, progress)
    }
  }, [options, uploadProgress])

  const uploadFile = useCallback(async (file: File, folder: string, index: number) => {
    try {
      updateProgress(index, 10)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)
      
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
        if (options.onError) {
          options.onError(file.name, error)
        }
        return
      }

      const data = await response.json()
      
      if (!data.itemId) {
        const error = 'Missing itemId in response'
        setUploadProgress(prev => prev.map((item, i) => 
          i === index ? { ...item, status: 'error', error } : item
        ))
        if (options.onError) {
          options.onError(file.name, error)
        }
        return
      }

      updateProgress(index, 75)

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
        if (options.onError) {
          options.onError(file.name, error)
        }
        return
      }

      const { publicUrl } = await linkRes.json()

      const uploadedFile: UploadedFile = {
        url: data.url,
        publicUrl,
        name: file.name,
        itemId: data.itemId,
        driveId: data.driveId,
        type: file.type,
        size: file.size,
        folder
      }

      setUploadProgress(prev => prev.map((item, i) => 
        i === index ? { ...item, progress: 100, status: 'success' } : item
      ))

      if (options.onSuccess) {
        options.onSuccess(uploadedFile)
      }

      return uploadedFile

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setUploadProgress(prev => prev.map((item, i) => 
        i === index ? { ...item, status: 'error', error: errorMessage } : item
      ))
      if (options.onError) {
        options.onError(file.name, errorMessage)
      }
    }
  }, [options, updateProgress])

  const uploadFiles = useCallback(async (files: File[], folder: string) => {
    setIsUploading(true)
    try {
      const results = await Promise.all(files.map((file, index) => uploadFile(file, folder, index)))
      return results.filter((result: unknown): result is UploadedFile => result !== undefined)
    } finally {
      setIsUploading(false)
    }
  }, [uploadFile])

  return {
    isUploading,
    uploadProgress,
    uploadFile,
    uploadFiles,
    setUploadProgress
  }
} 