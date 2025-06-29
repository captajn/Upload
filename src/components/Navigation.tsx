'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { 
  HiHome, 
  HiCloudUpload, 
  HiPhotograph, 
  HiCollection,
  HiCog,
  HiInformationCircle,
  HiMenu,
  HiX,
  HiSun,
  HiMoon,
  HiDesktopComputer,
  HiChartBar,
  HiDatabase
} from 'react-icons/hi'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const navigation: NavItem[] = [
  {
    name: 'Trang chủ',
    href: '/',
    icon: HiHome,
    description: 'Trang chủ của ứng dụng'
  },
  {
    name: 'Upload File',
    href: '/upload',
    icon: HiCloudUpload,
    description: 'Tải lên file mới'
  },
  {
    name: 'Thư viện',
    href: '/gallery',
    icon: HiPhotograph,
    description: 'Xem tất cả file đã tải lên'
  },
  {
    name: 'Bộ sưu tập',
    href: '/collections',
    icon: HiCollection,
    description: 'Quản lý bộ sưu tập file'
  },
  {
    name: 'Thống kê',
    href: '/stats',
    icon: HiChartBar,
    description: 'Thống kê dung lượng và hoạt động'
  },
  {
    name: 'Cài đặt',
    href: '/settings',
    icon: HiCog,
    description: 'Cài đặt ứng dụng'
  },
  {
    name: 'Giới thiệu',
    href: '/about',
    icon: HiInformationCircle,
    description: 'Thông tin về ứng dụng'
  }
]

const themeOptions = [
  { name: 'Sáng', value: 'light', icon: HiSun },
  { name: 'Tối', value: 'dark', icon: HiMoon },
  { name: 'Hệ thống', value: 'system', icon: HiDesktopComputer }
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => {
    setIsOpen(false)
    setShowThemeMenu(false)
  }

  const isActivePage = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  if (!mounted) return null

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/20 dark:border-gray-700/20' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3"
            >
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <HiDatabase className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  File Manager
                </span>
              </Link>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-2">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={`group relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActivePage(item.href)
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {isActivePage(item.href) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-200 dark:border-emerald-700"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}

              {/* Theme Selector */}
              <div className="relative ml-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {theme === 'light' && <HiSun className="w-5 h-5" />}
                  {theme === 'dark' && <HiMoon className="w-5 h-5" />}
                  {theme === 'system' && <HiDesktopComputer className="w-5 h-5" />}
                </motion.button>

                <AnimatePresence>
                  {showThemeMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-xl"
                    >
                      {themeOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                          onClick={() => {
                            setTheme(option.value)
                            setShowThemeMenu(false)
                          }}
                          className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                            theme === option.value
                              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                              : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                          }`}
                        >
                          <option.icon className="w-5 h-5" />
                          <span className="font-medium">{option.name}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl z-50 lg:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <HiDatabase className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      File Manager
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeMenu}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  >
                    <HiX className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {navigation.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className={`group flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 ${
                          isActivePage(item.href)
                            ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-emerald-600 dark:hover:text-emerald-400'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          isActivePage(item.href)
                            ? 'bg-emerald-100 dark:bg-emerald-900/30'
                            : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30'
                        }`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Theme Selector */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Giao diện
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {themeOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setTheme(option.value)}
                        className={`p-3 rounded-xl flex flex-col items-center space-y-1 transition-colors ${
                          theme === option.value
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <option.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{option.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Click outside to close theme menu */}
      {showThemeMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowThemeMenu(false)}
        />
      )}
    </>
  )
}