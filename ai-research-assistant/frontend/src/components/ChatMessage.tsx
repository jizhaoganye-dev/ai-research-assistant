'use client'

import { motion } from 'framer-motion'
import { Sparkles, User, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isAssistant = message.role === 'assistant'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-4 ${isAssistant ? '' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isAssistant
            ? 'bg-gradient-to-br from-primary-500 to-purple-600 glow'
            : 'bg-gradient-to-br from-gray-600 to-gray-700'
        }`}
      >
        {isAssistant ? (
          <Sparkles className="w-5 h-5 text-white" />
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isAssistant ? '' : 'text-right'}`}>
        <div
          className={`inline-block rounded-2xl px-6 py-4 ${
            isAssistant
              ? 'glass rounded-tl-none'
              : 'bg-primary-600 rounded-tr-none'
          }`}
        >
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const isInline = !match
                  
                  if (isInline) {
                    return (
                      <code className="bg-black/30 px-1.5 py-0.5 rounded text-primary-300" {...props}>
                        {children}
                      </code>
                    )
                  }
                  
                  return (
                    <div className="relative group">
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={handleCopy}
                          className="p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <pre className="code-block overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  )
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse">
                        {children}
                      </table>
                    </div>
                  )
                },
                th({ children }) {
                  return (
                    <th className="border border-white/10 px-4 py-2 bg-white/5 text-left">
                      {children}
                    </th>
                  )
                },
                td({ children }) {
                  return (
                    <td className="border border-white/10 px-4 py-2">
                      {children}
                    </td>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        
        <p className="text-xs text-gray-600 mt-2">
          {message.timestamp.toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </motion.div>
  )
}
