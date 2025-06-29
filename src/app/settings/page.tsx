'use client'

import PageLayout from '@/components/PageLayout'
import { motion } from 'framer-motion'
import { HiCog, HiShieldCheck, HiGlobe, HiBell, HiUser } from 'react-icons/hi'

const settingsCategories = [
  {
    name: 'Tài khoản',
    icon: HiUser,
    description: 'Quản lý thông tin cá nhân và tài khoản',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Bảo mật',
    icon: HiShieldCheck,
    description: 'Cài đặt bảo mật và quyền riêng tư',
    color: 'from-green-500 to-emerald-500'
  },
  {
    name: 'Thông báo',
    icon: HiBell,
    description: 'Tùy chỉnh thông báo và cảnh báo',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    name: 'Giao diện',
    icon: HiGlobe,
    description: 'Ngôn ngữ, theme và hiển thị',
    color: 'from-purple-500 to-indigo-500'
  }
]

export default function SettingsPage() {
  return (
    <PageLayout
      title="Cài đặt"
      description="Tùy chỉnh ứng dụng theo sở thích và nhu cầu của bạn."
    >
      <div className="space-y-8 pb-8">
        {/* Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className={`h-24 bg-gradient-to-r ${category.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-4 right-4">
                  <category.icon className="w-8 h-8 text-white/80" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {category.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <HiCog className="w-6 h-6 mr-3 text-emerald-600 dark:text-emerald-400" />
            Cài đặt nhanh
          </h2>
          
          <div className="space-y-6">
            {/* Auto Save */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Tự động lưu
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tự động lưu file sau khi upload
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600 transition-colors focus:outline-none"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </motion.button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Thông báo email
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Nhận thông báo qua email
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors focus:outline-none"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </motion.button>
            </div>

            {/* Public Sharing */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Chia sẻ công khai
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Cho phép chia sẻ file công khai
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600 transition-colors focus:outline-none"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  )
}