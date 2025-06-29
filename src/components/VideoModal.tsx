'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import VideoPlayer from './VideoPlayer'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  url: string
  type: string
  title?: string
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, url, type, title }) => {
  // Xác định loại media
  const mediaType = type.startsWith('audio/') ? 'audio' : 'video'

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80"
          onClick={onClose}
        />

        {/* Modal content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-[90vw] h-[80vh] bg-black rounded-lg overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>

          {/* Title */}
          {title && (
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
              <h3 className="text-white text-lg font-medium">{title}</h3>
            </div>
          )}

          {/* Video Player */}
          <VideoPlayer
            url={url}
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
              theme: '#10b981'
            }}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default VideoModal 