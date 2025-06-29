import { ReactNode } from 'react'

export interface UploadedFile {
  url: string
  publicUrl?: string
  name: string
  itemId: string
  driveId?: string
  type: string
  size: number
  folder: string
}

export interface UploadProgress {
  fileName: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
  type: string
  size: number
  folder: string
}

export interface CopyStatus {
  id: string
  status: 'copied' | 'error'
}

export interface FolderConfig {
  id: string
  name: string
  description: string
  icon: ReactNode
  acceptedTypes: string[]
  maxFileSize?: number
  requireAuth?: boolean
}

export interface ImagePreviewProps {
  url: string
  title?: string
  onClose: () => void
}

export interface MediaPreviewProps {
  url: string
  type: string
  className?: string
  title?: string
  itemId: string
  driveId?: string
}

export interface DocumentPreviewProps {
  url: string
  type: string
  className?: string
}

// Component Props Types
export interface FileItemProps {
  file: File
  objectUrl: string
  progress: UploadProgress
  onRemove: () => void
}

export interface FileListProps {
  files: File[]
  objectUrls: string[]
  uploadProgress: UploadProgress[]
  isUploading: boolean
  onUploadAll: () => void
  onRemoveAll: () => void
  onRemoveFile: (index: number) => void
}

export interface FolderButtonProps {
  folder: FolderConfig
  isSelected: boolean
  onClick: () => void
}

export interface FolderSelectorProps {
  folders: FolderConfig[]
  selectedFolder: string
  onFolderSelect: (folderId: string) => void
}

export interface FileTypeIconProps {
  type: string
  size?: 'normal' | 'large'
} 