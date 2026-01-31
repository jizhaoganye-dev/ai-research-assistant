/**
 * API Client for AI Research Assistant
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  model?: string
  stream?: boolean
  temperature?: number
  max_tokens?: number
}

export interface ChatResponse {
  id: string
  content: string
  model: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * Send a chat message and get a streaming response
 */
export async function* streamChat(
  messages: ChatMessage[],
  options: Partial<ChatRequest> = {}
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      stream: true,
      ...options,
    }),
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return
        try {
          const parsed = JSON.parse(data)
          if (parsed.content) {
            yield parsed.content
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

/**
 * Send a chat message and get a complete response
 */
export async function sendChat(
  messages: ChatMessage[],
  options: Partial<ChatRequest> = {}
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      stream: false,
      ...options,
    }),
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  return response.json()
}

/**
 * Upload a document for analysis
 */
export async function uploadDocument(file: File): Promise<{
  id: string
  filename: string
  status: string
}> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Upload Error: ${response.status}`)
  }

  return response.json()
}

/**
 * Get available LLM models
 */
export async function getModels(): Promise<{
  models: Array<{
    id: string
    name: string
    provider: string
  }>
}> {
  const response = await fetch(`${API_BASE_URL}/api/chat/models`)
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  return response.json()
}

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.ok
  } catch {
    return false
  }
}
