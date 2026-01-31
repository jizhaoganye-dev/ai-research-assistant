'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileText, FileCode, Copy, Check } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  messages: Message[]
  title?: string
}

export function ExportModal({ isOpen, onClose, messages, title = 'AI Research Assistant' }: ExportModalProps) {
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)

  const generateMarkdown = (): string => {
    let md = `# ${title}\n\n`
    md += `*エクスポート日時: ${new Date().toLocaleString('ja-JP')}*\n\n`
    md += `---\n\n`

    messages.forEach(msg => {
      const role = msg.role === 'user' ? '👤 ユーザー' : '🤖 AI'
      const time = msg.timestamp.toLocaleString('ja-JP')
      md += `### ${role}\n`
      md += `*${time}*\n\n`
      md += `${msg.content}\n\n`
      md += `---\n\n`
    })

    return md
  }

  const generateJSON = (): string => {
    return JSON.stringify({
      title,
      exportedAt: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }))
    }, null, 2)
  }

  const generateHTML = (): string => {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a, #020617);
      color: #e2e8f0;
      min-height: 100vh;
      padding: 2rem;
    }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { 
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }
    .meta { color: #64748b; font-size: 0.875rem; margin-bottom: 2rem; }
    .message { 
      background: rgba(255,255,255,0.05);
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    .message.user { border-left: 3px solid #38bdf8; }
    .message.assistant { border-left: 3px solid #818cf8; }
    .role { font-weight: 600; margin-bottom: 0.5rem; }
    .time { color: #64748b; font-size: 0.75rem; }
    .content { margin-top: 1rem; line-height: 1.6; white-space: pre-wrap; }
    code { background: rgba(0,0,0,0.3); padding: 0.2rem 0.4rem; border-radius: 0.25rem; }
    pre { background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p class="meta">エクスポート日時: ${new Date().toLocaleString('ja-JP')} | メッセージ数: ${messages.length}</p>
    
    ${messages.map(msg => `
    <div class="message ${msg.role}">
      <div class="role">${msg.role === 'user' ? '👤 ユーザー' : '🤖 AI'}</div>
      <div class="time">${msg.timestamp.toLocaleString('ja-JP')}</div>
      <div class="content">${msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>
    `).join('')}
  </div>
</body>
</html>`
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExport = async (format: 'markdown' | 'json' | 'html') => {
    setExporting(format)
    
    await new Promise(resolve => setTimeout(resolve, 500)) // Animation
    
    const timestamp = new Date().toISOString().split('T')[0]
    
    switch (format) {
      case 'markdown':
        downloadFile(generateMarkdown(), `chat-${timestamp}.md`, 'text/markdown')
        break
      case 'json':
        downloadFile(generateJSON(), `chat-${timestamp}.json`, 'application/json')
        break
      case 'html':
        downloadFile(generateHTML(), `chat-${timestamp}.html`, 'text/html')
        break
    }
    
    setExporting(null)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateMarkdown())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          className="glass rounded-2xl p-6 w-full max-w-md"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">エクスポート</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-400 text-sm mb-6">
            {messages.length} 件のメッセージをエクスポート
          </p>

          <div className="space-y-3">
            {/* Markdown */}
            <button
              onClick={() => handleExport('markdown')}
              disabled={exporting !== null}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">Markdown</p>
                <p className="text-xs text-gray-500">.md ファイルとしてダウンロード</p>
              </div>
              {exporting === 'markdown' ? (
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
              )}
            </button>

            {/* JSON */}
            <button
              onClick={() => handleExport('json')}
              disabled={exporting !== null}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <FileCode className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">JSON</p>
                <p className="text-xs text-gray-500">構造化データとしてダウンロード</p>
              </div>
              {exporting === 'json' ? (
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
              )}
            </button>

            {/* HTML */}
            <button
              onClick={() => handleExport('html')}
              disabled={exporting !== null}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">HTML</p>
                <p className="text-xs text-gray-500">スタイル付きWebページ</p>
              </div>
              {exporting === 'html' ? (
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
              )}
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                {copied ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <Copy className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">
                  {copied ? 'コピーしました！' : 'クリップボードにコピー'}
                </p>
                <p className="text-xs text-gray-500">Markdown形式でコピー</p>
              </div>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
