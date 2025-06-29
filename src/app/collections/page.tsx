'use client'

import PageLayout from '@/components/PageLayout'
import { motion } from 'framer-motion'
import { HiPlus, HiCollection, HiHeart, HiStar } from 'react-icons/hi'

const collections = [
  {
    name: 'Yêu thích',
    icon: HiHeart,
    count: 34,
    color: 'from-red-500 to-pink-500',
    description: 'File được đánh dấu yêu thích'
  },
  {
    name: 'Quan trọng',
    icon: HiStar,
    count: 12,
    color: 'from-yellow-400 to-orange-500',
    description: 'File quan trọng cần lưu ý'
  }
]

export default function CollectionsPage() {
  return (
    <PageLayout
      title="Bộ sưu tập"
      description="Tổ chức và quản lý file theo các bộ sưu tập tùy chỉnh của bạn."
    >
      <div className="space-y-8 pb-8">
        {/* Create New Collection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg overflow-hidden cursor-pointer"
        >
          <div className="p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <HiPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Tạo bộ sưu tập mới</h3>
                <p className="text-emerald-100">Nhóm các file theo chủ đề hoặc dự án</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Existing Collections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className={`h-32 bg-gradient-to-r ${collection.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-4 right-4">
                  <collection.icon className="w-8 h-8 text-white/80" />
                </div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-semibold text-white">
                    {collection.name}
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {collection.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {collection.count}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    file
                  </span>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Empty State for More Collections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 flex items-center justify-center min-h-[200px]"
          >
            <div className="text-center">
              <HiCollection className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Tạo thêm bộ sưu tập để tổ chức file tốt hơn
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  )
}