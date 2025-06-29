'use client'

import FileUploader from '@/components/FileUploader'
import StorageQuota from '@/components/StorageQuota'
import PageLayout from '@/components/PageLayout'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <PageLayout
      title="Upload File Siêu Tốc"
      description="Tải lên và chia sẻ file của bạn một cách dễ dàng. Hỗ trợ nhiều định dạng: Ảnh, PDF, Word, Excel, PowerPoint, ZIP..."
    >
      <div className="space-y-6 pb-8">
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
    </PageLayout>
  )
}
