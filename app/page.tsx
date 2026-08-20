'use client'

import { useMemo } from 'react'
import { ChatPanel } from '@/components/chat-panel'
import { HistorySidebar } from '@/components/history-sidebar'
import { UsageSidebar } from '@/components/usage-sidebar'
import { totalTokensOf, useConversations } from '@/lib/use-conversations'

export default function Page() {
  const {
    hydrated,
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    createConversation,
    deleteConversation,
    saveMessages,
  } = useConversations()

  const sessionTotal = useMemo(
    () => conversations.reduce((sum, c) => sum + totalTokensOf(c), 0),
    [conversations],
  )

  return (
    <main className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <HistorySidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onCreate={createConversation}
        onDelete={deleteConversation}
      />

      {activeConversation ? (
        <ChatPanel
          key={activeConversation.id}
          conversation={activeConversation}
          onMessagesChange={saveMessages}
        />
      ) : (
        <section className="flex flex-1 flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <p className="max-w-sm text-sm text-muted-foreground text-pretty">
            {hydrated
              ? 'Select a conversation or start a new one to begin chatting.'
              : 'Loading your conversations…'}
          </p>
          {hydrated && (
            <button
              type="button"
              onClick={createConversation}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              New conversation
            </button>
          )}
        </section>
      )}

      <UsageSidebar
        activeMessages={activeConversation?.messages ?? []}
        sessionTotal={sessionTotal}
        conversationCount={conversations.length}
      />
    </main>
  )
}
