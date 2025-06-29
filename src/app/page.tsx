'use client'

import FileUploader from '../components/FileUploader'
import StorageQuota from '../components/StorageQuota'
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
          Upload File Siêu Tốc
        </h1>
        <p className="mt-4 text-center text-gray-600 dark:text-gray-300 text-sm md:text-base">
          Tải lên và chia sẻ file của bạn một cách dễ dàng. Hỗ trợ nhiều định dạng: Ảnh, PDF, Word, Excel, PowerPoint, ZIP...
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

        {/* File Uploader */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <FileUploader />
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400"
      >
        <p className="text-sm">
          © 2024 Upload File App. Tất cả quyền được bảo lưu.
        </p>
      </motion.footer>
    </main>
  )
}
