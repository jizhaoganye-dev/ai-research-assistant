'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Key, Cpu, Palette, Save, Check, AlertCircle } from 'lucide-react'
import { getSettings, saveSettings, AppSettings } from '@/lib/storage'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSettingsChange: (settings: AppSettings) => void
}

export function SettingsModal({ isOpen, onClose, onSettingsChange }: SettingsModalProps) {
  const [settings, setSettings] = useState<AppSettings>(getSettings())
  const [saved, setSaved] = useState(false)
  const [apiKeyVisible, setApiKeyVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSettings(getSettings())
      setSaved(false)
    }
  }, [isOpen])

  const handleSave = () => {
    saveSettings(settings)
    onSettingsChange(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const models = [
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', description: '最高品質の応答' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', description: '高速 + 長文対応' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', description: '高速 + 低コスト' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', description: '最高品質' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', description: 'バランス型' },
  ]

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
          className="glass rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">設定</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* API Key */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                <Key className="w-4 h-4" />
                API キー
              </label>
              <div className="relative">
                <input
                  type={apiKeyVisible ? 'text' : 'password'}
                  value={settings.apiKey || ''}
                  onChange={e => setSettings({ ...settings, apiKey: e.target.value })}
                  placeholder="sk-... または sk-ant-..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setApiKeyVisible(!apiKeyVisible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-sm"
                >
                  {apiKeyVisible ? '隠す' : '表示'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                OpenAI または Anthropic の API キーを入力してください。
                キーはブラウザのローカルストレージに保存されます。
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                <Cpu className="w-4 h-4" />
                使用モデル
              </label>
              <div className="space-y-2">
                {models.map(model => (
                  <button
                    key={model.id}
                    onClick={() => setSettings({ ...settings, model: model.id })}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                      settings.model === model.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{model.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                          {model.provider}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{model.description}</p>
                    </div>
                    {settings.model === model.id && (
                      <Check className="w-5 h-5 text-primary-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                <Palette className="w-4 h-4" />
                テーマ
              </label>
              <div className="flex gap-2">
                {(['dark', 'light', 'system'] as const).map(theme => (
                  <button
                    key={theme}
                    onClick={() => setSettings({ ...settings, theme })}
                    className={`flex-1 py-2 px-4 rounded-xl border transition-all ${
                      settings.theme === theme
                        ? 'border-primary-500 bg-primary-500/10 text-white'
                        : 'border-white/10 hover:border-white/20 text-gray-400'
                    }`}
                  >
                    {theme === 'dark' ? 'ダーク' : theme === 'light' ? 'ライト' : 'システム'}
                  </button>
                ))}
              </div>
            </div>

            {/* Streaming */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">ストリーミング応答</p>
                <p className="text-xs text-gray-500">AIの応答をリアルタイムで表示</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, streamingEnabled: !settings.streamingEnabled })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.streamingEnabled ? 'bg-primary-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                    settings.streamingEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Warning */}
            {!settings.apiKey && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-200">APIキーが設定されていません</p>
                  <p className="text-xs text-yellow-200/70 mt-1">
                    デモモードで動作します。実際のAI応答を利用するにはAPIキーを設定してください。
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={handleSave}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-primary-500 to-purple-600 text-white hover:opacity-90'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5" />
                  保存しました
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  設定を保存
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
