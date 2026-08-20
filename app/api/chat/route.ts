import type { ChatUIMessage } from '@/lib/types'
import { CHAT_MODEL } from '@/lib/types'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Approximate free-tier pricing references for visibility in this PoC.
const INPUT_COST_PER_MILLION = 0.05
const OUTPUT_COST_PER_MILLION = 0.08

export const maxDuration = 60

function estimateCostUsd(promptTokens: number, completionTokens: number) {
  const promptCost = (promptTokens / 1_000_000) * INPUT_COST_PER_MILLION
  const completionCost = (completionTokens / 1_000_000) * OUTPUT_COST_PER_MILLION
  return Number((promptCost + completionCost).toFixed(8))
}

function sanitizeMessages(messages: ChatUIMessage[]) {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role,
      content: m.content,
    }))
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return Response.json(
        {
          error:
            'Server is missing GROQ_API_KEY. Add it to your environment variables.',
        },
        { status: 500 },
      )
    }

    const { messages }: { messages: ChatUIMessage[] } = await req.json()
    const payloadMessages = sanitizeMessages(messages)

    const startedAt = Date.now()

    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful, concise assistant. Answer clearly and format responses with Markdown-style structure when useful.',
          },
          ...payloadMessages,
        ],
        temperature: 0.7,
      }),
    })

    const responseTimeMs = Date.now() - startedAt

    if (!groqResponse.ok) {
      const failure = await groqResponse.json().catch(() => null)
      const errorMessage =
        failure?.error?.message ??
        `Groq request failed with status ${groqResponse.status}`

      return Response.json(
        {
          error: errorMessage,
        },
        { status: groqResponse.status },
      )
    }

    const data = (await groqResponse.json()) as {
      id?: string
      choices?: Array<{
        message?: {
          content?: string
        }
      }>
      usage?: {
        prompt_tokens?: number
        completion_tokens?: number
        total_tokens?: number
      }
      model?: string
    }

    const content = data.choices?.[0]?.message?.content?.trim() ?? ''
    const promptTokens = data.usage?.prompt_tokens ?? 0
    const completionTokens = data.usage?.completion_tokens ?? 0
    const totalTokens = data.usage?.total_tokens ?? promptTokens + completionTokens
    const costUsd = estimateCostUsd(promptTokens, completionTokens)

    const message: ChatUIMessage = {
      id: data.id ?? crypto.randomUUID(),
      role: 'assistant',
      content: content || 'No response text returned by model.',
      createdAt: Date.now(),
      metadata: {
        createdAt: Date.now(),
        model: data.model ?? CHAT_MODEL,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
        },
        inputTokens: promptTokens,
        outputTokens: completionTokens,
        totalTokens,
        responseTimeMs,
        costUsd,
      },
    }

    return Response.json({ message })
  } catch {
    return Response.json(
      {
        error:
          'Unexpected server error while calling Groq. Please try again in a moment.',
      },
      { status: 500 },
    )
  }
}
