'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageSquareText, RotateCcw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Composer } from '@/components/composer'
import { MessageList } from '@/components/message-list'
import type { ChatUIMessage, Conversation } from '@/lib/types'

function EmptyState() {
  const prompts = [
    'Explain the difference between input and output tokens.',
    'Write a haiku about distributed systems.',
    'Summarize how LLM inference latency works.',
  ]
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-muted">
        <MessageSquareText className="size-6 text-muted-foreground" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-foreground text-balance">
        Start the conversation
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground text-pretty">
        Messages stream from Groq. Every reply reports its token usage, and your
        running totals show up in the sidebar.
      </p>
      <ul className="mt-5 flex flex-wrap justify-center gap-2">
        {prompts.map((p) => (
          <li
            key={p}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
          >
            {p}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ChatPanel({
  conversation,
  onMessagesChange,
}: {
  conversation: Conversation
  onMessagesChange: (id: string, messages: ChatUIMessage[]) => void
}) {
  const [messages, setMessages] = useState<ChatUIMessage[]>(conversation.messages)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    onMessagesChange(conversation.id, messages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  const requestAssistant = useCallback(async (thread: ChatUIMessage[]) => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setError(null)
    setStatus('loading')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: thread }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const maybeJson = await res.json().catch(() => null)
        const message = maybeJson?.error ?? `Request failed with status ${res.status}`
        throw new Error(message)
      }

      const payload = (await res.json()) as {
        message: ChatUIMessage
      }

      setMessages((prev) => [...prev, payload.message])
      setStatus('idle')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus('idle')
        return
      }
      const message = err instanceof Error ? err.message : 'Unknown request error'
      setError(message)
      setStatus('error')
    }
  }, [])

  const sendMessage = useCallback(
    async ({ text }: { text: string }) => {
      const userMessage: ChatUIMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        createdAt: Date.now(),
      }

      const nextMessages = [...messages, userMessage]
      setMessages(nextMessages)
      await requestAssistant(nextMessages)
    },
    [messages, requestAssistant],
  )

  const regenerate = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUserMessage) return
    const userCutoff = messages.findLastIndex((m) => m.role === 'user')
    const baseMessages = userCutoff >= 0 ? messages.slice(0, userCutoff + 1) : messages
    setMessages(baseMessages)
    await requestAssistant(baseMessages)
  }, [messages, requestAssistant])

  const stop = useCallback(() => {
    controllerRef.current?.abort()
    setStatus('idle')
  }, [])

  const isBusy = status === 'loading'

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !error ? (
          <EmptyState />
        ) : (
          <MessageList messages={messages} status={status} />
        )}

        {error && (
          <div className="mx-auto w-full max-w-3xl px-4 pb-4">
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-destructive">Request failed</p>
                <p className="mt-0.5 text-xs text-muted-foreground text-pretty">
                  {error}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => regenerate()}
                className="shrink-0"
              >
                <RotateCcw className="size-3.5" />
                Retry
              </Button>
            </div>
          </div>
        )}
      </div>

      <Composer
        onSend={(text) => sendMessage({ text })}
        onStop={stop}
        isBusy={isBusy}
      />
    </section>
  )
}
