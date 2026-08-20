'use client'

import { useEffect, useRef } from 'react'
import { Bot, User } from 'lucide-react'
import type { ChatUIMessage } from '@/lib/types'

function messageText(message: ChatUIMessage) {
  return message.parts
    .filter((p) => p.type === 'text')
    .map((p) => (p as { text: string }).text)
    .join('')
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  )
}

export function MessageList({
  messages,
  status,
}: {
  messages: ChatUIMessage[]
  status: 'submitted' | 'streaming' | 'ready' | 'error'
}) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  const waitingForFirstToken =
    status === 'submitted' &&
    messages[messages.length - 1]?.role === 'user'

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      {messages.map((message) => {
        const isUser = message.role === 'user'
        const text = messageText(message)
        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <span
              className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                isUser
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
              aria-hidden="true"
            >
              {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
            </span>

            <div
              className={`flex min-w-0 max-w-[85%] flex-col gap-1 ${
                isUser ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  isUser
                    ? 'rounded-tr-sm bg-primary text-primary-foreground'
                    : 'rounded-tl-sm bg-card text-card-foreground border border-border'
                }`}
              >
                {text || (message.role === 'assistant' ? <TypingDots /> : null)}
              </div>

              {/* Per-message token metadata for assistant replies */}
              {!isUser && (message.metadata?.totalTokens ?? 0) > 0 && (
                <span className="px-1 font-mono text-[11px] text-muted-foreground/70">
                  {message.metadata?.inputTokens ?? 0} in ·{' '}
                  {message.metadata?.outputTokens ?? 0} out ·{' '}
                  {message.metadata?.totalTokens ?? 0} total
                </span>
              )}
            </div>
          </div>
        )
      })}

      {waitingForFirstToken && (
        <div className="flex gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <Bot className="size-4" />
          </span>
          <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5">
            <TypingDots />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
