'use client'

import PageLayout from '@/components/PageLayout'
import { motion } from 'framer-motion'
import { HiPhotograph, HiVideoCamera, HiMusicNote, HiDocument } from 'react-icons/hi'

const categories = [
  {
    name: 'Hình ảnh',
    icon: HiPhotograph,
    count: 245,
    color: 'from-pink-500 to-rose-500',
    description: 'Ảnh JPG, PNG, GIF'
  },
  {
    name: 'Video',
    icon: HiVideoCamera,
    count: 67,
    color: 'from-purple-500 to-indigo-500',
    description: 'Video MP4, WebM, AVI'
  },
  {
    name: 'Âm thanh',
    icon: HiMusicNote,
    count: 123,
    color: 'from-green-500 to-emerald-500',
    description: 'MP3, WAV, FLAC'
  },
  {
    name: 'Tài liệu',
    icon: HiDocument,
    count: 89,
    color: 'from-blue-500 to-cyan-500',
    description: 'PDF, Word, Excel'
  }
]

export default function GalleryPage() {
  return (
    <PageLayout
      title="Thư viện File"
      description="Quản lý và xem tất cả các file đã tải lên được tổ chức theo danh mục."
    >
      <div className="space-y-8 pb-8">
        {/* Category Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            >
              <div className={`h-24 bg-gradient-to-r ${category.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-4 right-4">
                  <category.icon className="w-8 h-8 text-white/80" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {category.count}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    file
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Files */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            File gần đây
          </h2>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiPhotograph className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Chưa có file nào. Hãy tải lên file đầu tiên của bạn!
            </p>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  )
}