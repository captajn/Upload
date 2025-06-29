import React from 'react'
import { FiImage, FiFileText, FiFolder, FiMusic, FiVideo } from 'react-icons/fi'
import type { FolderConfig } from '@/types/uploader'

export const FOLDERS: FolderConfig[] = [
  {
    id: 'Images',
    name: 'Images',
    description: 'Ảnh: PNG, JPG, JPEG, GIF, WEBP, SVG',
    icon: React.createElement(FiImage, { className: "w-6 h-6" }),
    acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  },
  {
    id: 'Docs',
    name: 'Documents',
    description: 'Tài liệu: PDF, Word, Excel, PowerPoint, Text',
    icon: React.createElement(FiFileText, { className: "w-6 h-6" }),
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
    icon: React.createElement(FiVideo, { className: "w-6 h-6" }),
    acceptedTypes: ['video/mp4', 'video/webm', 'video/x-matroska', 'video/avi', 'video/quicktime']
  },
  {
    id: 'Audio',
    name: 'Audio',
    description: 'Âm thanh: MP3, WAV, OGG, M4A, FLAC',
    icon: React.createElement(FiMusic, { className: "w-6 h-6" }),
    acceptedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/flac']
  },
  {
    id: 'Files',
    name: 'Files',
    description: 'Các loại file khác (CAD, code, etc)',
    icon: React.createElement(FiFolder, { className: "w-6 h-6" }),
    acceptedTypes: ['*/*']
  }
]

export const BLOCKED_EXTENSIONS = [
  '.sh', '.bash', '.ksh', '.csh', '.zsh', '.fish',
  '.bat', '.cmd', '.ps1', '.psm1', '.vbs', '.vbe', '.js', '.jse', '.wsf', '.wsh',
  '.php', '.php3', '.php4', '.php5', '.phtml',
  '.exe', '.msi', '.dll', '.bin', '.iso',
  '.asp', '.aspx', '.jsp', '.jspx', '.cgi', '.pl', '.py',
  '.env', '.config', '.ini', '.conf'
]

export const BLOCKED_MIME_TYPES = [
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