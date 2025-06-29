'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdStorage, MdMemory } from 'react-icons/md'

interface DriveQuota {
  name: string
  used: number
  total: number
  remaining: number
  usedGB: string
  totalGB: string
  remainingGB: string
  percentage: number
}

export default function StorageQuota() {
  const [quota, setQuota] = useState<DriveQuota | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const res = await fetch('/api/sharepoint')
        const data = await res.json()
        if (data.quotas && data.quotas[0]) {
          setQuota(data.quotas[0])
        }
      } catch (error) {
        console.error('Error fetching quota:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuota()
  }, [])

  if (isLoading) {
    return (
      <div className="animate-pulse bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
      </div>
    )
  }

  if (!quota) return null;

  // Định dạng lại số GB để gọn hơn
  const formatGB = (gbString: string) => {
    const gb = parseFloat(gbString);
    if (gb >= 1000) {
      return `${(gb / 1000).toFixed(1)}TB`;
    }
    return `${parseFloat(gbString).toFixed(2)}GB`;
  };

  const usedFormatted = formatGB(quota.usedGB);
  const totalFormatted = formatGB(quota.totalGB);

  // Quyết định màu sắc dựa trên phần trăm sử dụng
  const getColor = () => {
    if (quota.percentage > 90) return {
      bgFrom: 'from-rose-500', 
      bgTo: 'to-red-500',
      text: 'text-red-500'
    };
    if (quota.percentage > 70) return {
      bgFrom: 'from-amber-400', 
      bgTo: 'to-orange-500',
      text: 'text-amber-500'
    };
    return {
      bgFrom: 'from-emerald-400', 
      bgTo: 'to-green-500',
      text: 'text-emerald-500'
    };
  };
  
  const colors = getColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm overflow-hidden relative"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={() => setShowDetails(!showDetails)}
    >
      <motion.div 
        className="absolute top-1 right-2 text-xs font-medium"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <span className={`
          px-3 py-1 rounded-full font-semibold
          bg-gradient-to-r ${colors.bgFrom} ${colors.bgTo} text-white
          flex items-center gap-1
        `}>
          <MdStorage className="animate-pulse" />
          {quota.percentage}%
        </span>
      </motion.div>

      <div className="flex items-center gap-2 mb-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className={`p-2 rounded-full ${colors.text} bg-gray-50 dark:bg-gray-700`}
        >
          <MdMemory size={18} />
        </motion.div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Dung lượng lưu trữ
          </h3>
          <motion.p 
            className="text-xs text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Đã sử dụng {usedFormatted} / {totalFormatted}
          </motion.p>
        </div>
      </div>

      <div className="relative pt-1 pb-3">
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${quota.percentage}%` }}
            transition={{ 
              delay: 0.2, 
              duration: 1.5,
              ease: "easeOut" 
            }}
            className={`h-full rounded-full bg-gradient-to-r ${colors.bgFrom} ${colors.bgTo}`}
          />
        </div>
        <AnimatePresence>
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-white dark:bg-gray-900 opacity-75"
              initial={{ left: "-10%", scale: 0 }}
              animate={{
                left: ["0%", "20%", "40%", "60%", "80%", "100%"],
                top: [
                  "100%",
                  `${80 - Math.random() * 20}%`,
                  `${90 - Math.random() * 30}%`,
                  `${80 - Math.random() * 20}%`,
                  "100%"
                ],
                scale: [0, 1, 1, 1, 0],
                opacity: [0, 0.8, 0.8, 0.8, 0]
              }}
              transition={{
                duration: 4,
                delay: i * 0.5,
                repeat: Infinity,
                repeatDelay: i * 0.2
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
} 