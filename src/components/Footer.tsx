'use client'

import { motion } from 'framer-motion'
import { HiHeart, HiSparkles, HiLightningBolt } from 'react-icons/hi'
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

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Logo và slogan */}
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
              ChibiLỏ
            </motion.div>
            <motion.div
              variants={sparkleAnimation}
              initial="initial"
              animate="animate"
            >
              <HiSparkles className="h-5 w-5 text-yellow-400" />
            </motion.div>
          </motion.div>

          {/* Slogan */}
          <motion.div
            className="flex flex-col items-center space-y-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Dev Chibi Lỏ số 1 thế giới</span>
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                <HiLightningBolt className="h-5 w-5 text-yellow-500" />
              </motion.div>
            </div>
            <span className="text-xs italic text-gray-500 dark:text-gray-500">Đố ai dám nhận số 2</span>
          </motion.div>

          {/* Heart Animation */}
          <motion.div
            className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400"
            whileHover={{ scale: 1.1 }}
          >
            <span>Made with</span>
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
            <span>by ChibiLỏ</span>
          </motion.div>

          {/* Copyright */}
          <motion.p
            className="text-xs text-gray-400 dark:text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            © {new Date().getFullYear()} ChibiLỏ
          </motion.p>
        </div>
      </div>
    </footer>
  )
} 