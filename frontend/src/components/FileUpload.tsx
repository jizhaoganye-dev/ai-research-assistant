'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, X, FileText, Image, FileCode, Loader2 } from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  content: string
  status: 'uploading' | 'ready' | 'error'
}

interface FileUploadProps {
  onFileContent: (content: string, fileName: string) => void
  onClose: () => void
}

export function FileUpload({ onFileContent, onClose }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image
    if (type.includes('javascript') || type.includes('python') || type.includes('json')) return FileCode
    return FileText
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = (e) => reject(e)
      reader.readAsText(file)
    })
  }

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadedFile[] = []

    for (const file of Array.from(fileList)) {
      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type || 'text/plain',
        content: '',
        status: 'uploading'
      }
      newFiles.push(uploadedFile)
    }

    setFiles(prev => [...prev, ...newFiles])

    // Read file contents
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      try {
        const content = await readFileContent(file)
        setFiles(prev => prev.map(f => 
          f.id === newFiles[i].id 
            ? { ...f, content, status: 'ready' as const }
            : f
        ))
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === newFiles[i].id 
            ? { ...f, status: 'error' as const }
            : f
        ))
      }
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const analyzeFile = (file: UploadedFile) => {
    if (file.status === 'ready' && file.content) {
      onFileContent(file.content, file.name)
      onClose()
    }
  }

  const analyzeAllFiles = () => {
    const readyFiles = files.filter(f => f.status === 'ready')
    if (readyFiles.length > 0) {
      const combinedContent = readyFiles
        .map(f => `=== ${f.name} ===\n${f.content}`)
        .join('\n\n')
      onFileContent(combinedContent, readyFiles.map(f => f.name).join(', '))
      onClose()
    }
  }

  return (
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
        className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">ファイルをアップロード</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-white/20 hover:border-white/40 hover:bg-white/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.json,.csv,.py,.js,.ts,.tsx,.jsx,.html,.css,.xml,.yaml,.yml"
            onChange={e => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary-400' : 'text-gray-500'}`} />
          <p className="text-white font-medium mb-2">
            ファイルをドラッグ＆ドロップ
          </p>
          <p className="text-gray-500 text-sm">
            または クリックしてファイルを選択
          </p>
          <p className="text-gray-600 text-xs mt-2">
            対応形式: TXT, MD, JSON, CSV, Python, JavaScript, TypeScript, HTML, CSS
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">
                {files.length} ファイル選択中
              </p>
              {files.some(f => f.status === 'ready') && (
                <button
                  onClick={analyzeAllFiles}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  すべて分析
                </button>
              )}
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {files.map(file => {
                  const FileIcon = getFileIcon(file.type)
                  return (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="glass-light rounded-lg p-3 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <FileIcon className="w-5 h-5 text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{file.name}</p>
                        <p className="text-gray-500 text-xs">
                          {formatFileSize(file.size)}
                          {file.status === 'uploading' && ' · 読み込み中...'}
                          {file.status === 'ready' && ' · 準備完了'}
                          {file.status === 'error' && ' · エラー'}
                        </p>
                      </div>
                      {file.status === 'uploading' && (
                        <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
                      )}
                      {file.status === 'ready' && (
                        <button
                          onClick={() => analyzeFile(file)}
                          className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-lg text-sm hover:bg-primary-500/30 transition-colors"
                        >
                          分析
                        </button>
                      )}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
