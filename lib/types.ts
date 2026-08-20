import type { UIMessage } from 'ai'

/**
 * Model routed through Groq via the Vercel AI Gateway.
 * The Gateway model string identifies the model; provider routing to Groq
 * is pinned with `providerOptions.gateway.only` in the chat route.
 */
export const CHAT_MODEL = 'openai/gpt-oss-120b'

export type ChatMetadata = {
  createdAt?: number
  model?: string
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
}

export type ChatUIMessage = UIMessage<ChatMetadata>

export type Conversation = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messages: ChatUIMessage[]
}
