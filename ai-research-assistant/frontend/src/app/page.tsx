'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Sparkles, 
  FileText, 
  Code, 
  Zap, 
  Brain,
  MessageSquare,
  Upload,
  Settings,
  Moon,
  ChevronRight,
  Search
} from 'lucide-react'
import { ChatMessage } from '@/components/ChatMessage'
import { FeatureCard } from '@/components/FeatureCard'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { FileUpload } from '@/components/FileUpload'
import { SettingsModal } from '@/components/SettingsModal'
import { ExportModal } from '@/components/ExportModal'
import { AuthModal } from '@/components/AuthModal'
import { 
  getSettings, 
  saveConversation, 
  generateTitle,
  AppSettings,
  StoredConversation 
} from '@/lib/storage'
import { streamChat, ChatMessage as APIChatMessage } from '@/lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  fileName?: string
}

const DEMO_RESPONSES: Record<string, string> = {
  default: `ご質問ありがとうございます。

現在はデモモードで動作しています。実際のAI応答を利用するには、設定画面（⚙️）でAPIキーを設定してください。

**デモモードで試せる機能：**
- 「Pythonでスクレイピングコードを書いて」→ コード生成
- 「このデータを分析して」→ 分析レポート
- ファイルをアップロード → ファイル分析

設定からOpenAI/Claude APIキーを設定すると、どんな質問にもお答えできます！`,

  greeting: `こんにちは！AI Research Assistantです。

私は以下のことができます：

- **ドキュメント分析**: PDFやテキストファイルをアップロードして、内容を分析・要約
- **コード生成**: 要件を伝えるだけで、高品質なコードを生成
- **リサーチ支援**: 複雑な質問に対して、構造化された回答を提供

何かお手伝いできることはありますか？`,

  news: `## 📰 今話題のニュース

申し訳ありませんが、現在**デモモード**で動作しているため、リアルタイムのニュースを取得できません。

### 実際のAI応答を利用するには

1. ヘッダーの **⚙️ 設定** をクリック
2. **OpenAI API キー** または **Anthropic API キー** を入力
3. 設定を保存

APIキーを設定すると、最新のニュースや様々な質問にお答えできます！

---

**💡 ヒント**: [OpenAI](https://platform.openai.com/api-keys) または [Anthropic](https://console.anthropic.com/) でAPIキーを取得できます。`,

  weather: `## 🌤️ 天気情報

申し訳ありませんが、現在**デモモード**のため、リアルタイムの天気情報を取得できません。

設定画面でAPIキーを設定すると、天気情報もお答えできます！`,

  translation: `## 🌐 翻訳

デモモードでは翻訳機能に制限があります。

設定画面からAPIキーを設定すると、高品質な翻訳が可能になります！`,
  
  code: `もちろんです！以下はPythonでのWebスクレイピングコードです：

\`\`\`python
import requests
from bs4 import BeautifulSoup
import pandas as pd

def scrape_products(url: str) -> list[dict]:
    """
    ECサイトから商品情報をスクレイピング
    """
    response = requests.get(url, headers={
        'User-Agent': 'Mozilla/5.0'
    })
    soup = BeautifulSoup(response.text, 'html.parser')
    
    products = []
    for item in soup.select('.product-item'):
        products.append({
            'name': item.select_one('.title').text.strip(),
            'price': item.select_one('.price').text.strip(),
            'url': item.select_one('a')['href']
        })
    
    return products

# 実行
products = scrape_products('https://example.com/products')
df = pd.DataFrame(products)
df.to_csv('products.csv', index=False)
\`\`\`

このコードの特徴：
- ✅ 型ヒントを使用した読みやすいコード
- ✅ エラーハンドリングを考慮
- ✅ pandas連携でCSV出力対応`,

  analysis: `## 📊 分析結果

アップロードされたドキュメントを分析しました。

### 主要なポイント

1. **売上トレンド**: 前年比15%増加
2. **主要顧客セグメント**: 20-30代女性が全体の45%
3. **改善推奨事項**: モバイルUXの最適化

### 詳細データ

| 指標 | 現在値 | 目標値 | 達成率 |
|------|--------|--------|--------|
| MAU | 150,000 | 200,000 | 75% |
| CVR | 2.3% | 3.0% | 77% |
| NPS | 42 | 50 | 84% |

### 次のアクション

- モバイルファーストデザインの導入
- A/Bテストの実施（CTAボタン最適化）
- ユーザーインタビューの実施`
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [uploadedFileContent, setUploadedFileContent] = useState<string>('')
  const [uploadedFileName, setUploadedFileName] = useState<string>('')
  const [settings, setSettings] = useState<AppSettings>(getSettings())
  const [conversationId, setConversationId] = useState<string>('')
  const [streamingContent, setStreamingContent] = useState<string>('')
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Initialize conversation ID
  useEffect(() => {
    setConversationId(`conv_${Date.now()}`)
    
    // Check for saved user
    const savedUser = localStorage.getItem('ai-research-user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (userData: { name: string; email: string; avatar?: string }) => {
    setUser(userData)
    localStorage.setItem('ai-research-user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('ai-research-user')
  }

  const handleNewChat = () => {
    setMessages([])
    setShowWelcome(true)
    setConversationId(`conv_${Date.now()}`)
    setUploadedFileContent('')
    setUploadedFileName('')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileContent = (content: string, fileName: string) => {
    setUploadedFileContent(content)
    setUploadedFileName(fileName)
    // Auto-populate input with analysis prompt
    setInput(`このファイル「${fileName}」の内容を分析してください`)
  }

  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings)
  }

  // Save conversation when messages change
  useEffect(() => {
    if (messages.length > 0 && conversationId) {
      const conversation: StoredConversation = {
        id: conversationId,
        title: generateTitle(messages[0].content),
        messages: messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp.toISOString(),
          fileName: m.fileName
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      saveConversation(conversation)
    }
  }, [messages, conversationId])

  // Real API call with streaming
  const callLLMAPI = async (userContent: string): Promise<string> => {
    if (!settings.apiKey) {
      // Demo mode - return after delay
      return ''
    }

    try {
      const apiMessages: APIChatMessage[] = [
        {
          role: 'system',
          content: 'You are AI Research Assistant, a helpful AI that assists with research, code generation, and document analysis. Respond in Japanese unless asked otherwise.'
        },
        ...messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        })),
        { role: 'user' as const, content: userContent }
      ]

      let fullResponse = ''
      
      for await (const chunk of streamChat(apiMessages, { model: settings.model })) {
        fullResponse += chunk
        setStreamingContent(fullResponse)
      }
      
      setStreamingContent('')
      return fullResponse
    } catch (error) {
      console.error('API Error:', error)
      return ''
    }
  }

  const analyzeFileContent = (content: string, fileName: string): string => {
    const lines = content.split('\n')
    const wordCount = content.split(/\s+/).filter(Boolean).length
    const charCount = content.length
    const lineCount = lines.length
    
    // Detect file type and analyze accordingly
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    
    let analysis = `## 📄 ファイル分析結果: ${fileName}\n\n`
    analysis += `### 📊 基本情報\n\n`
    analysis += `| 項目 | 値 |\n|------|------|\n`
    analysis += `| ファイル名 | ${fileName} |\n`
    analysis += `| 行数 | ${lineCount.toLocaleString()} 行 |\n`
    analysis += `| 文字数 | ${charCount.toLocaleString()} 文字 |\n`
    analysis += `| 単語数 | ${wordCount.toLocaleString()} 語 |\n\n`
    
    if (['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c'].includes(ext)) {
      // Code file analysis
      const functions = (content.match(/function\s+\w+|def\s+\w+|const\s+\w+\s*=\s*\(|=>\s*{/g) || []).length
      const classes = (content.match(/class\s+\w+/g) || []).length
      const imports = (content.match(/import\s+|from\s+|require\(/g) || []).length
      const comments = (content.match(/\/\/|#|\/\*|\"\"\"/g) || []).length
      
      analysis += `### 💻 コード分析\n\n`
      analysis += `| 項目 | 数 |\n|------|------|\n`
      analysis += `| 関数/メソッド | ${functions} 個 |\n`
      analysis += `| クラス | ${classes} 個 |\n`
      analysis += `| インポート文 | ${imports} 個 |\n`
      analysis += `| コメント | ${comments} 箇所 |\n\n`
      
      analysis += `### 📝 コード抜粋（先頭20行）\n\n`
      analysis += '```' + ext + '\n'
      analysis += lines.slice(0, 20).join('\n')
      if (lineCount > 20) analysis += '\n// ... 以下省略 ...'
      analysis += '\n```\n'
    } else if (['json'].includes(ext)) {
      // JSON analysis
      try {
        const json = JSON.parse(content)
        const keys = Object.keys(json)
        analysis += `### 🔑 JSON構造\n\n`
        analysis += `- トップレベルキー数: ${keys.length}\n`
        analysis += `- キー一覧: ${keys.slice(0, 10).join(', ')}${keys.length > 10 ? '...' : ''}\n\n`
      } catch {
        analysis += `⚠️ JSONのパースに失敗しました\n\n`
      }
    } else if (['csv'].includes(ext)) {
      // CSV analysis
      const headers = lines[0]?.split(',') || []
      const dataRows = lineCount - 1
      analysis += `### 📊 CSV分析\n\n`
      analysis += `| 項目 | 値 |\n|------|------|\n`
      analysis += `| カラム数 | ${headers.length} |\n`
      analysis += `| データ行数 | ${dataRows} |\n`
      analysis += `| カラム名 | ${headers.slice(0, 5).join(', ')}${headers.length > 5 ? '...' : ''} |\n\n`
      
      analysis += `### 📝 データプレビュー（先頭5行）\n\n`
      analysis += '```\n'
      analysis += lines.slice(0, 5).join('\n')
      analysis += '\n```\n'
    } else {
      // Text file analysis
      analysis += `### 📝 内容プレビュー（先頭500文字）\n\n`
      analysis += '```\n'
      analysis += content.slice(0, 500)
      if (content.length > 500) analysis += '\n... 以下省略 ...'
      analysis += '\n```\n'
    }
    
    analysis += `\n### 🔍 次のアクション\n\n`
    analysis += `- 「このファイルの要約を作成して」\n`
    analysis += `- 「〇〇を検索して」\n`
    analysis += `- 「問題点を指摘して」\n`
    
    return analysis
  }

  const searchInFile = (query: string): string => {
    if (!uploadedFileContent) {
      return `⚠️ ファイルがアップロードされていません。\n\n先にファイルをアップロードしてから検索してください。`
    }

    const lines = uploadedFileContent.split('\n')
    const matches: { line: number; content: string }[] = []
    const lowerQuery = query.toLowerCase()
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(lowerQuery)) {
        matches.push({ line: index + 1, content: line.trim() })
      }
    })
    
    let result = `## 🔍 検索結果: "${query}"\n\n`
    result += `**ファイル:** ${uploadedFileName}\n\n`
    
    if (matches.length === 0) {
      result += `❌ 「${query}」は見つかりませんでした。\n`
    } else {
      result += `✅ **${matches.length}件** の一致が見つかりました\n\n`
      result += `| 行番号 | 内容 |\n|--------|------|\n`
      matches.slice(0, 20).forEach(match => {
        const highlighted = match.content.length > 80 
          ? match.content.slice(0, 80) + '...' 
          : match.content
        result += `| ${match.line} | \`${highlighted.replace(/\|/g, '\\|')}\` |\n`
      })
      if (matches.length > 20) {
        result += `\n*... 他 ${matches.length - 20} 件*\n`
      }
    }
    
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      fileName: uploadedFileName || undefined,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setShowWelcome(false)
    setIsLoading(true)

    // Try real API first, fall back to demo
    const apiResponse = await callLLMAPI(currentInput)
    
    let responseContent = apiResponse

    // If no API response, use demo mode
    if (!responseContent) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Check if this is a file analysis request
      if (uploadedFileContent && (currentInput.includes('分析') || currentInput.includes('ファイル'))) {
        responseContent = analyzeFileContent(uploadedFileContent, uploadedFileName)
        // Clear file content after analysis
        setUploadedFileContent('')
        setUploadedFileName('')
      } else if (currentInput.includes('検索') || currentInput.includes('探して')) {
        // Extract search query
        const searchMatch = currentInput.match(/「(.+?)」|'(.+?)'|"(.+?)"|を検索|を探して/)
        const searchQuery = searchMatch?.[1] || searchMatch?.[2] || searchMatch?.[3] || 
          currentInput.replace(/検索|探して|して|を/g, '').trim()
        responseContent = searchInFile(searchQuery)
      } else if (currentInput.toLowerCase().includes('コード') || currentInput.toLowerCase().includes('スクレイピング') || currentInput.includes('プログラム') || currentInput.includes('実装')) {
        responseContent = DEMO_RESPONSES.code
      } else if (currentInput.toLowerCase().includes('分析') || currentInput.toLowerCase().includes('データ') || currentInput.includes('レポート')) {
        responseContent = DEMO_RESPONSES.analysis
      } else if (currentInput.includes('ニュース') || currentInput.includes('話題') || currentInput.includes('最新')) {
        responseContent = DEMO_RESPONSES.news
      } else if (currentInput.includes('天気') || currentInput.includes('気温') || currentInput.includes('weather')) {
        responseContent = DEMO_RESPONSES.weather
      } else if (currentInput.includes('翻訳') || currentInput.includes('translate') || currentInput.includes('英語') || currentInput.includes('日本語に')) {
        responseContent = DEMO_RESPONSES.translation
      } else if (currentInput.includes('こんにちは') || currentInput.includes('はじめまして') || currentInput.includes('hello')) {
        responseContent = DEMO_RESPONSES.greeting
      } else {
        responseContent = DEMO_RESPONSES.default
      }
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const features = [
    {
      icon: Brain,
      title: 'LLM Powered',
      description: 'GPT-4 / Claude 3による高度な言語理解',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FileText,
      title: 'ドキュメント分析',
      description: 'PDF・テキストを即座に分析・要約',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Code,
      title: 'コード生成',
      description: '要件からプロダクションレベルのコード生成',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: '爆速レスポンス',
      description: 'ストリーミングによるリアルタイム応答',
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  return (
    <div className="flex h-screen">
      <Sidebar 
        user={user}
        onLoginClick={() => setShowAuth(true)}
        onLogout={handleLogout}
        onNewChat={handleNewChat}
      />
      
      {/* File Upload Modal */}
      <AnimatePresence>
        {showFileUpload && (
          <FileUpload 
            onFileContent={handleFileContent}
            onClose={() => setShowFileUpload(false)}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={handleSettingsChange}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        messages={messages}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onLogin={handleLogin}
      />
      
      <div className="flex-1 flex flex-col">
        <Header 
          onSettingsClick={() => setShowSettings(true)}
          onExportClick={() => setShowExport(true)}
          hasMessages={messages.length > 0}
        />
        
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                {showWelcome && messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-12"
                  >
                    {/* Hero Section */}
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-8"
                    >
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 mb-6 glow">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">AI Research Assistant</span>
                      </h1>
                      <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        LLMを活用した次世代リサーチツール。
                        ドキュメント分析、コード生成、質問応答を一つのインターフェースで。
                      </p>
                    </motion.div>

                    {/* Feature Cards */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
                    >
                      {features.map((feature, index) => (
                        <FeatureCard key={feature.title} {...feature} index={index} />
                      ))}
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="flex flex-wrap justify-center gap-3"
                    >
                      {[
                        'Pythonでスクレイピングコードを書いて',
                        'このデータを分析して',
                        'READMEを作成して'
                      ].map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => setInput(prompt)}
                          className="px-4 py-2 rounded-full glass-light hover:bg-white/10 transition-all text-sm text-gray-300 flex items-center gap-2"
                        >
                          <ChevronRight className="w-4 h-4" />
                          {prompt}
                        </button>
                      ))}
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                    
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-4"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="glass rounded-2xl rounded-tl-none px-6 py-4">
                          <div className="typing-indicator flex gap-1">
                            <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                            <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                            <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-white/5 p-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <div className="glass rounded-2xl p-2 flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFileUpload(true)}
                    className={`p-3 rounded-xl hover:bg-white/5 transition-colors ${
                      uploadedFileName 
                        ? 'text-primary-400 bg-primary-500/10' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title={uploadedFileName || "ファイルをアップロード"}
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  
                  {uploadedFileName && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary-500/10 rounded-lg">
                      <FileText className="w-4 h-4 text-primary-400" />
                      <span className="text-sm text-primary-300 truncate max-w-32">
                        {uploadedFileName}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFileContent('')
                          setUploadedFileName('')
                        }}
                        className="text-gray-500 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="メッセージを入力... (Shift+Enterで改行)"
                    rows={1}
                    className="flex-1 bg-transparent resize-none outline-none text-white placeholder-gray-500 py-3 px-2 max-h-32"
                    style={{ minHeight: '24px' }}
                  />
                  
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className={`p-3 rounded-xl transition-all ${
                      input.trim() && !isLoading
                        ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white hover:opacity-90 glow'
                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  AI Research Assistant は GPT-4 / Claude 3 を活用しています
                </p>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
