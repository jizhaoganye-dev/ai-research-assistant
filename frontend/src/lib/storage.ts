/**
 * Local Storage utilities for chat history persistence
 */

export interface StoredMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  fileName?: string
}

export interface StoredConversation {
  id: string
  title: string
  messages: StoredMessage[]
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'ai-research-assistant-conversations'
const SETTINGS_KEY = 'ai-research-assistant-settings'

/**
 * Get all conversations from storage
 */
export function getConversations(): StoredConversation[] {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * Save a conversation
 */
export function saveConversation(conversation: StoredConversation): void {
  if (typeof window === 'undefined') return
  
  const conversations = getConversations()
  const existingIndex = conversations.findIndex(c => c.id === conversation.id)
  
  if (existingIndex >= 0) {
    conversations[existingIndex] = conversation
  } else {
    conversations.unshift(conversation)
  }
  
  // Keep only last 50 conversations
  const trimmed = conversations.slice(0, 50)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
}

/**
 * Get a specific conversation
 */
export function getConversation(id: string): StoredConversation | null {
  const conversations = getConversations()
  return conversations.find(c => c.id === id) || null
}

/**
 * Delete a conversation
 */
export function deleteConversation(id: string): void {
  if (typeof window === 'undefined') return
  
  const conversations = getConversations()
  const filtered = conversations.filter(c => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

/**
 * Clear all conversations
 */
export function clearAllConversations(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Generate a title from the first message
 */
export function generateTitle(firstMessage: string): string {
  const maxLength = 30
  const cleaned = firstMessage.replace(/\n/g, ' ').trim()
  return cleaned.length > maxLength 
    ? cleaned.slice(0, maxLength) + '...'
    : cleaned
}

// Settings
export interface AppSettings {
  theme: 'dark' | 'light' | 'system'
  model: string
  apiKey?: string
  streamingEnabled: boolean
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  model: 'gpt-4',
  streamingEnabled: true,
}

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings
  
  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: Partial<AppSettings>): void {
  if (typeof window === 'undefined') return
  
  const current = getSettings()
  const updated = { ...current, ...settings }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
}
