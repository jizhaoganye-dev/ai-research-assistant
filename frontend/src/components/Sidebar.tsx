'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  History,
  Star,
  LogIn,
  LogOut,
  User
} from 'lucide-react'
import { getConversations, deleteConversation, StoredConversation } from '@/lib/storage'

interface ChatHistory {
  id: string
  title: string
  timestamp: Date
  starred?: boolean
}

interface SidebarProps {
  user?: { name: string; email: string; avatar?: string } | null
  onLoginClick?: () => void
  onLogout?: () => void
  onNewChat?: () => void
  onSelectConversation?: (id: string) => void
}

export function Sidebar({ user, onLoginClick, onLogout, onNewChat, onSelectConversation }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [history, setHistory] = useState<ChatHistory[]>([])

  useEffect(() => {
    const conversations = getConversations()
    setHistory(conversations.map(c => ({
      id: c.id,
      title: c.title,
      timestamp: new Date(c.updatedAt),
      starred: false
    })))
  }, [])

  const handleDelete = (id: string) => {
    deleteConversation(id)
    setHistory(prev => prev.filter(h => h.id !== id))
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 60 : 280 }}
      className="relative h-screen border-r border-white/5 flex flex-col bg-dark-300/50 flex-shrink-0"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-50 w-6 h-6 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* New Chat Button */}
      <div className="p-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewChat}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-medium transition-all hover:opacity-90 glow ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <Plus className="w-5 h-5" />
          {!isCollapsed && <span>新しいチャット</span>}
        </motion.button>
      </div>

      {/* Chat History */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>履歴</span>
          </div>

          <div className="space-y-1">
            {history.length === 0 ? (
              <p className="text-xs text-gray-600 px-3 py-2">履歴がありません</p>
            ) : (
              history.map((chat) => (
                <motion.div
                  key={chat.id}
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                >
                  <button
                    onClick={() => onSelectConversation?.(chat.id)}
                    className="flex-1 flex items-center gap-3 min-w-0"
                  >
                    <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 truncate">{chat.title}</p>
                      <p className="text-xs text-gray-600">
                        {chat.timestamp.toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </button>
                  {chat.starred && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                  <button
                    onClick={() => handleDelete(chat.id)}
                    className="p-1 rounded hover:bg-white/10 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* User Section */}
      {!isCollapsed && (
        <div className="p-3 border-t border-white/5">
          {user ? (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                title="ログアウト"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm text-white">ログイン</p>
                <p className="text-xs text-gray-500">履歴を保存</p>
              </div>
              <LogIn className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      )}
    </motion.aside>
  )
}
