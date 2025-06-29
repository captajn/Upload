'use client'

import { motion } from 'framer-motion'
import { HiHeart, HiSparkles, HiMail, HiPhone, HiGlobe } from 'react-icons/hi'
import Link from 'next/link'
import type { Variants } from 'framer-motion'

const bounceAnimation: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: [0.45, 0, 0.55, 1]
    }
  }
}

const sparkleAnimation: Variants = {
  initial: { scale: 0, rotate: 0 },
  animate: {
    scale: [0, 1, 0],
    rotate: [0, 180, 360],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: [0.45, 0, 0.55, 1],
      times: [0, 0.5, 1]
    }
  }
}

interface FooterLinkProps {
  href: string
  children: React.ReactNode
}

const FooterLink = ({ href, children }: FooterLinkProps) => (
  <Link href={href}>
    <motion.span
      className="text-gray-600 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
      whileHover={{ scale: 1.05 }}
    >
      {children}
    </motion.span>
  </Link>
)

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 py-8 mt-auto border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo và Thông tin */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent"
                variants={bounceAnimation}
                initial="initial"
                animate="animate"
              >
                Úp Lá File
              </motion.div>
              <motion.div
                variants={sparkleAnimation}
                initial="initial"
                animate="animate"
              >
                <HiSparkles className="h-5 w-5 text-yellow-400" />
              </motion.div>
            </motion.div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
              Giải pháp lưu trữ và chia sẻ file thông minh cho doanh nghiệp của bạn
            </p>
          </div>

          {/* Liên kết hữu ích */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Liên Kết</h3>
            <div className="flex flex-col space-y-2">
              <FooterLink href="/about">Giới thiệu</FooterLink>
              <FooterLink href="/privacy">Chính sách bảo mật</FooterLink>
              <FooterLink href="/terms">Điều khoản sử dụng</FooterLink>
              <FooterLink href="/help">Trung tâm trợ giúp</FooterLink>
            </div>
          </div>

          {/* Thông tin liên hệ */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Liên Hệ</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <motion.div className="flex items-center space-x-2" whileHover={{ x: 5 }}>
                <HiMail className="h-5 w-5 text-emerald-500" />
                <span className="text-gray-600 dark:text-gray-400">support@upla.com</span>
              </motion.div>
              <motion.div className="flex items-center space-x-2" whileHover={{ x: 5 }}>
                <HiPhone className="h-5 w-5 text-emerald-500" />
                <span className="text-gray-600 dark:text-gray-400">1900 1234</span>
              </motion.div>
              <motion.div className="flex items-center space-x-2" whileHover={{ x: 5 }}>
                <HiGlobe className="h-5 w-5 text-emerald-500" />
                <span className="text-gray-600 dark:text-gray-400">upla.com</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Copyright và Made with love */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <motion.p
              className="text-sm text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              © {new Date().getFullYear()} Úp Lá File. Bản quyền thuộc về Công ty TNHH Úp Lá
            </motion.p>
            <motion.div
              className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400"
              whileHover={{ scale: 1.1 }}
            >
              <span>Phát triển bởi</span>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  transition: {
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <HiHeart className="h-5 w-5 text-red-500" />
              </motion.div>
              <span>đội ngũ Úp Lá</span>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  )
} 