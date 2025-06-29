import { BLOCKED_EXTENSIONS, BLOCKED_MIME_TYPES } from '@/config/constants'
import type { FolderConfig } from '@/types/uploader'

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Thay thế ký tự đặc biệt bằng dấu _
    .replace(/\.{2,}/g, '.') // Ngăn chặn path traversal
    .replace(/\s+/g, '_') // Thay thế dấu cách bằng dấu _
}

export const isFileSafe = async (file: File): Promise<boolean> => {
  const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return false
  }

  if (BLOCKED_MIME_TYPES.includes(file.type)) {
    return false
  }

  return new Promise<boolean>((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 16)
      const header = Array.from(arr).map(byte => byte.toString(16).padStart(2, '0')).join('')
      
      const dangerousHeaders = [
        'MZ',
        '7F454C46',
        '504B0304',
        '#!/',
        '<?php',
        '<%',
      ]

      const isDangerous = dangerousHeaders.some(dHeader => 
        header.toLowerCase().startsWith(dHeader.toLowerCase())
      )
      
      resolve(!isDangerous)
    }
    reader.readAsArrayBuffer(file.slice(0, 16))
  })
}

export const detectFileFolder = (fileType: string, folders: FolderConfig[]): string => {
  for (const folder of folders) {
    if (folder.id === 'others') continue
    
    const isAccepted = folder.acceptedTypes.some(type => {
      if (type === fileType) return true
      if (type.endsWith('/*')) {
        const typePrefix = type.split('/')[0]
        return fileType.startsWith(typePrefix + '/')
      }
      return false
    })
    
    if (isAccepted) return folder.id
  }
  
  return 'others'
} 