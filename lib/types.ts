/**
 * groq/compound-mini served through Groq's OpenAI-compatible API.
 */
export const CHAT_MODEL = 'groq/compound-mini'

export type ChatUsage = {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export type ChatMetadata = {
  createdAt?: number
  model?: string
  usage?: ChatUsage
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
  responseTimeMs?: number
  costUsd?: number
}

export type ChatUIMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
  metadata?: ChatMetadata
}

export type Conversation = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messages: ChatUIMessage[]
}
