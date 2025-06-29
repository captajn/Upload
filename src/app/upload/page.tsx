'use client'

import PageLayout from '@/components/PageLayout'
import FileUploader from '@/components/FileUploader'
import StorageQuota from '@/components/StorageQuota'
import { motion } from 'framer-motion'

export default function UploadPage() {
  return (
    <PageLayout
      title="Tải lên File"
      description="Chọn và tải lên các file của bạn. Hỗ trợ đa dạng định dạng file với giao diện thân thiện."
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