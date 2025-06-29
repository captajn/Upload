'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { IconType } from 'react-icons'
import FileUploader from '@/components/FileUploader'
import StorageQuota from '@/components/StorageQuota'
import { HiSparkles, HiCloudUpload, HiLightningBolt, HiShieldCheck, HiUsers, HiFolder } from 'react-icons/hi'
import Link from 'next/link'

// Floating shapes component
const FloatingShapes = () => {
  const shapes = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 40 + 20,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    color: ['bg-emerald-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400', 'bg-yellow-400'][Math.floor(Math.random() * 5)],
    opacity: Math.random() * 0.3 + 0.1
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className={`absolute rounded-full ${shape.color}`}
          style={{
            width: shape.size,
            height: shape.size,
            left: `${shape.initialX}%`,
            top: `${shape.initialY}%`,
            opacity: shape.opacity
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  )
}

interface StatsCounterProps {
  end: number
  label: string
  icon: IconType
}

// Stats counter component
const StatsCounter = ({ end, label, icon: Icon }: StatsCounterProps) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (count < end) {
        setCount(prev => Math.min(prev + Math.ceil(end / 50), end))
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [count, end])

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
      className="text-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
        className="inline-block"
      >
        <Icon className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
      </motion.div>
      <motion.div
        className="text-3xl font-bold text-white mb-2"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {count.toLocaleString()}+
      </motion.div>
      <div className="text-emerald-200">{label}</div>
    </motion.div>
  )
}

interface FeatureCardProps {
  icon: IconType
  title: string
  description: string
  delay: number
}

// Feature card component
const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
  <motion.div
    initial={{ y: 50, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ delay, type: "spring", stiffness: 100 }}
    whileHover={{ 
      y: -10,
      scale: 1.02,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }}
    className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
  >
    <motion.div
      whileHover={{ rotate: 360, scale: 1.2 }}
      transition={{ duration: 0.6 }}
      className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg"
    >
      <Icon className="w-8 h-8 text-white" />
    </motion.div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-emerald-500 transition-colors">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
      {description}
    </p>
  </motion.div>
)

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-blue-900/20">
        <FloatingShapes />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main heading with animation */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.02, 1],
                  rotate: [0, 1, -1, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-block"
              >
                <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  Úp Lá File
                </h1>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex items-center justify-center gap-3 mb-6"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <HiSparkles className="w-8 h-8 text-yellow-500" />
                </motion.div>
                <span className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300">
                  Upload & Share Made Fun!
                </span>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <HiLightningBolt className="w-8 h-8 text-emerald-500" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed"
            >
              Nơi bạn có thể tải lên, chia sẻ và quản lý file một cách
              <motion.span
                animate={{ color: ['#10b981', '#3b82f6', '#8b5cf6', '#10b981'] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="font-semibold mx-2"
              >
                dễ dàng
              </motion.span>
              và
              <motion.span
                animate={{ color: ['#f59e0b', '#ef4444', '#8b5cf6', '#f59e0b'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="font-semibold mx-2"
              >
                an toàn
              </motion.span>
              nhất!
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              <Link href="#upload">
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <HiCloudUpload className="w-6 h-6" />
                  </motion.div>
                  Bắt đầu Upload
                </motion.button>
              </Link>

              <Link href="/video">
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    borderColor: "#10b981"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold text-lg rounded-2xl hover:border-emerald-500 hover:text-emerald-500 transition-all duration-300 flex items-center gap-3"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <HiFolder className="w-6 h-6" />
                  </motion.div>
                  Xem Danh Sách
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              <StatsCounter end={1000} label="Files Uploaded" icon={HiCloudUpload} />
              <StatsCounter end={500} label="Happy Users" icon={HiUsers} />
              <StatsCounter end={99} label="Uptime %" icon={HiShieldCheck} />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-gray-400 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Storage Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <StorageQuota />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Tại sao chọn
              <motion.span
                animate={{ color: ['#10b981', '#3b82f6', '#8b5cf6', '#10b981'] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mx-3"
              >
                Úp Lá File
              </motion.span>
              ?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Chúng tôi mang đến trải nghiệm upload và chia sẻ file tuyệt vời nhất
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={HiCloudUpload}
              title="Upload Siêu Nhanh"
              description="Công nghệ tiên tiến giúp bạn upload file với tốc độ ánh sáng. Hỗ trợ đa định dạng và không giới hạn kích thước."
              delay={0.1}
            />
            <FeatureCard
              icon={HiShieldCheck}
              title="Bảo Mật Tuyệt Đối"
              description="Mã hóa end-to-end và backup tự động. File của bạn được bảo vệ an toàn như trong két sắt."
              delay={0.2}
            />
            <FeatureCard
              icon={HiLightningBolt}
              title="Chia Sẻ Dễ Dàng"
              description="Tạo link chia sẻ chỉ trong 1 click. Kiểm soát quyền truy cập và theo dõi lượt xem chi tiết."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.h2
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              >
                Sẵn sàng Upload?
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block ml-4"
                >
                  🚀
                </motion.span>
              </motion.h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Kéo thả file hoặc chọn từ máy tính của bạn
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700"
            >
              <FileUploader />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Fun floating elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-10 w-4 h-4 bg-yellow-400 rounded-full opacity-30"
        />
        <motion.div
          animate={{
            rotate: -360,
            y: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/3 right-20 w-6 h-6 bg-pink-400 rounded-full opacity-20"
        />
        <motion.div
          animate={{
            x: [0, 30, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 left-1/4 w-5 h-5 bg-blue-400 rounded-full opacity-25"
        />
      </div>
    </main>
  )
}