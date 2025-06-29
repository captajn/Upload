'use client'

import { motion } from 'framer-motion'
import FileUploader from '@/components/FileUploader'
import StorageQuota from '@/components/StorageQuota'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Upload và Chia sẻ File Dễ Dàng
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Tải lên và chia sẻ file của bạn một cách nhanh chóng và an toàn
          </p>
        </motion.div>

        {/* Storage Quota */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <StorageQuota />
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <FileUploader />
        </motion.div>
      </div>
    </main>
  )
}
