'use client'

import { motion } from 'framer-motion'
import { Settings, Download, Sparkles } from 'lucide-react'

interface HeaderProps {
  onSettingsClick: () => void
  onExportClick: () => void
  hasMessages: boolean
}

export function Header({ onSettingsClick, onExportClick, hasMessages }: HeaderProps) {
  return (
    <header className="border-b border-white/5 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-lg font-semibold text-white">AI Research Assistant</h1>
            <p className="text-xs text-gray-500">Powered by GPT-4 / Claude 3</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {hasMessages && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExportClick}
              className="p-2.5 rounded-xl glass-light hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              title="会話をエクスポート"
            >
              <Download className="w-5 h-5" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSettingsClick}
            className="p-2.5 rounded-xl glass-light hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            title="設定"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </header>
  )
}
