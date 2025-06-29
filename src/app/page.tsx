'use client'

import ImageUploader from '../components/ImageUploader'
import StorageQuota from '../components/StorageQuota'
import { FaGithub } from 'react-icons/fa'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-emerald-600 dark:text-emerald-400">
          Upload Ảnh Siêu Tốc
        </h1>
        <p className="mt-4 text-center text-gray-600 dark:text-gray-300 text-sm md:text-base">
          Tải lên và chia sẻ ảnh của bạn một cách dễ dàng
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 md:py-8 space-y-6">
        {/* Storage Quota */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <StorageQuota />
        </motion.div>

        {/* Image Uploader */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <ImageUploader />
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="container mx-auto px-4 py-6 md:py-8 text-center"
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="text-2xl md:text-3xl font-bold text-emerald-500 dark:text-emerald-400"
          >
            🌟 Web up ảnh by Chibi 🌟
          </motion.div>
          
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Dev lỏ số 1 thế giới 
            <motion.span
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 5, 0]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="inline-block ml-2"
            >
              🚀
            </motion.span>
          </p>

          <a 
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-sm md:text-base text-gray-600 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
          >
            <FaGithub className="w-4 h-4 md:w-5 md:h-5" />
            <span>GitHub</span>
          </a>
        </div>
      </motion.footer>
    </main>
  )
}
