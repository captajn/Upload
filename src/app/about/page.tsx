'use client'

import PageLayout from '@/components/PageLayout'
import { motion } from 'framer-motion'
import { HiHeart, HiCode, HiLightningBolt, HiShieldCheck } from 'react-icons/hi'

const features = [
  {
    name: 'Tốc độ cao',
    description: 'Upload và tải xuống file với tốc độ nhanh nhất',
    icon: HiLightningBolt,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    name: 'Bảo mật',
    description: 'Mã hóa end-to-end đảm bảo an toàn dữ liệu',
    icon: HiShieldCheck,
    color: 'from-green-500 to-emerald-500'
  },
  {
    name: 'Đa dạng định dạng',
    description: 'Hỗ trợ hầu hết các định dạng file phổ biến',
    icon: HiCode,
    color: 'from-blue-500 to-cyan-500'
  }
]

const team = [
  {
    name: 'Đội ngũ phát triển',
    role: 'Full-stack Development',
    description: 'Passionate về việc tạo ra những sản phẩm tuyệt vời'
  }
]

export default function AboutPage() {
  return (
    <PageLayout
      title="Giới thiệu"
      description="Tìm hiểu về ứng dụng File Manager và đội ngũ phát triển."
    >
      <div className="space-y-12 pb-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <HiHeart className="w-12 h-12 text-white" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
            >
              File Manager được phát triển với mục tiêu mang đến trải nghiệm quản lý file 
              tốt nhất cho người dùng. Chúng tôi tin rằng việc lưu trữ và chia sẻ file 
              nên đơn giản, nhanh chóng và an toàn.
            </motion.p>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className={`h-32 bg-gradient-to-r ${feature.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-4 left-6">
                  <feature.icon className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Đội ngũ phát triển
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Những người đằng sau ứng dụng File Manager
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-2">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Liên hệ với chúng tôi</h2>
          <p className="text-emerald-100 mb-6">
            Có ý kiến đóng góp hoặc cần hỗ trợ? Chúng tôi luôn sẵn sàng lắng nghe!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-emerald-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Gửi phản hồi
          </motion.button>
        </motion.div>
      </div>
    </PageLayout>
  )
}