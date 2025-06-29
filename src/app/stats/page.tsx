'use client'

import PageLayout from '@/components/PageLayout'
import StorageQuota from '@/components/StorageQuota'
import { motion } from 'framer-motion'
import { HiTrendingUp, HiCloudUpload, HiEye, HiDownload } from 'react-icons/hi'

const stats = [
  {
    name: 'Tổng file tải lên',
    value: '524',
    change: '+12%',
    changeType: 'increase',
    icon: HiCloudUpload,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Lượt xem',
    value: '8,429',
    change: '+23%',
    changeType: 'increase',
    icon: HiEye,
    color: 'from-green-500 to-emerald-500'
  },
  {
    name: 'Lượt tải xuống',
    value: '1,247',
    change: '+8%',
    changeType: 'increase',
    icon: HiDownload,
    color: 'from-purple-500 to-indigo-500'
  },
  {
    name: 'Tăng trưởng',
    value: '18.3%',
    change: '+2.1%',
    changeType: 'increase',
    icon: HiTrendingUp,
    color: 'from-orange-500 to-red-500'
  }
]

const recentActivity = [
  { action: 'Tải lên', file: 'presentation.pdf', time: '2 phút trước' },
  { action: 'Tải xuống', file: 'image_2024.jpg', time: '5 phút trước' },
  { action: 'Chia sẻ', file: 'document.docx', time: '10 phút trước' },
  { action: 'Xem', file: 'video_demo.mp4', time: '15 phút trước' },
  { action: 'Tải lên', file: 'spreadsheet.xlsx', time: '1 giờ trước' }
]

export default function StatsPage() {
  return (
    <PageLayout
      title="Thống kê"
      description="Xem tổng quan về hoạt động và sử dụng dung lượng của bạn."
    >
      <div className="space-y-8 pb-8">
        {/* Storage Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <StorageQuota />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className={`h-20 bg-gradient-to-r ${stat.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-4 right-4">
                  <stat.icon className="w-6 h-6 text-white/80" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {stat.name}
                </h3>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </span>
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Hoạt động gần đây
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {activity.action.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action} <span className="text-emerald-600 dark:text-emerald-400">{activity.file}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageLayout>
  )
}