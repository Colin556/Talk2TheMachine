import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from 'ai'
import type { ChatUIMessage } from '@/lib/types'
import { CHAT_MODEL } from '@/lib/types'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: ChatUIMessage[] } = await req.json()

  const result = streamText({
    model: CHAT_MODEL,
    system:
      'You are a helpful, concise assistant. Answer clearly and format responses with Markdown-style structure when useful.',
    messages: await convertToModelMessages(messages),
    providerOptions: {
      // Route this request through Groq's inference infrastructure via the
      // Vercel AI Gateway. `only` restricts execution to the Groq provider.
      gateway: {
        only: ['groq'],
      },
    },
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      messageMetadata: ({ part }) => {
        if (part.type === 'start') {
          return {
            createdAt: Date.now(),
            model: CHAT_MODEL,
          }
        }
        if (part.type === 'finish') {
          const usage = part.totalUsage
          return {
            inputTokens: usage.inputTokens ?? 0,
            outputTokens: usage.outputTokens ?? 0,
            totalTokens: usage.totalTokens ?? 0,
          }
        }
      },
    }),
  })
}
