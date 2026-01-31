'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Github, Chrome, Sparkles } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (user: { name: string; email: string; avatar?: string }) => void
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onLogin({
      name: name || email.split('@')[0],
      email,
      avatar: undefined
    })
    
    setIsLoading(false)
    onClose()
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    
    // Simulate OAuth
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onLogin({
      name: provider === 'google' ? 'Google User' : 'GitHub User',
      email: `user@${provider}.com`,
      avatar: undefined
    })
    
    setIsLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass rounded-2xl p-8 w-full max-w-md"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 mb-4 glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {mode === 'login' ? 'おかえりなさい' : 'アカウント作成'}
            </h2>
            <p className="text-gray-400 mt-2">
              {mode === 'login' 
                ? 'AI Research Assistantにログイン' 
                : '無料でアカウントを作成'}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-white"
            >
              <Chrome className="w-5 h-5" />
              Googleでログイン
            </button>
            <button
              onClick={() => handleOAuthLogin('github')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-white"
            >
              <Github className="w-5 h-5" />
              GitHubでログイン
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark-200 text-gray-500">または</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">名前</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="田中 太郎"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">メールアドレス</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">パスワード</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                mode === 'login' ? 'ログイン' : 'アカウント作成'
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <p className="text-center text-gray-400 mt-6">
            {mode === 'login' ? (
              <>
                アカウントをお持ちでない方は{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-primary-400 hover:underline"
                >
                  新規登録
                </button>
              </>
            ) : (
              <>
                すでにアカウントをお持ちの方は{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary-400 hover:underline"
                >
                  ログイン
                </button>
              </>
            )}
          </p>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
