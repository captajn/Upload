'use client'

import { motion } from 'framer-motion'
import Navigation from './Navigation'

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
}

export default function PageLayout({ 
  children, 
  title, 
  description, 
  className = '' 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      
      <main className={`pt-16 ${className}`}>
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto px-4 py-8"
          >
            <div className="text-center mb-8">
              <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4"
              >
                {title}
              </motion.h1>
              {description && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                >
                  {description}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: title ? 0.3 : 0.1 }}
          className="container mx-auto px-4"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}