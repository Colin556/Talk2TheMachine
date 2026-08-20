'use client'

import { useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
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
  const { messages, sendMessage, status, stop, error, regenerate } =
    useChat<ChatUIMessage>({
      // Re-key per conversation so switching threads resets the hook state
      // and seeds it with that conversation's stored messages.
      id: conversation.id,
      messages: conversation.messages,
      transport: new DefaultChatTransport({ api: '/api/chat' }),
    })

  // Persist the thread whenever it settles (ready) or errors out, so token
  // metadata attached on finish is captured in storage.
  useEffect(() => {
    if (status === 'ready' || status === 'error') {
      onMessagesChange(conversation.id, messages)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, messages])

  const isBusy = status === 'submitted' || status === 'streaming'

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
                <p className="text-sm font-medium text-destructive">
                  Couldn&apos;t reach the model
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground text-pretty">
                  The request to the AI Gateway failed. This is often a billing
                  or configuration issue on the gateway rather than a problem
                  with your message.
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
