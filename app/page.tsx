'use client'

import { useMemo, useState } from 'react'
import { History, Gauge } from 'lucide-react'
import { ChatPanel } from '@/components/chat-panel'
import { HistorySidebar } from '@/components/history-sidebar'
import { UsageSidebar } from '@/components/usage-sidebar'
import { totalCostOf, totalTokensOf, useConversations } from '@/lib/use-conversations'

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

  const sessionCost = useMemo(
    () => conversations.reduce((sum, c) => sum + totalCostOf(c), 0),
    [conversations],
  )

  const [showHistory, setShowHistory] = useState(false)
  const [showUsage, setShowUsage] = useState(false)

  function MobileHeader() {
    return (
      <div className="md:hidden flex items-center gap-1 border-b border-border bg-background/90 backdrop-blur px-3 py-2">
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Toggle history"
        >
          <History className="size-4" />
          History
        </button>
        <div className="flex-1 text-center text-sm font-semibold text-foreground">
          Token Console
        </div>
        <button
          type="button"
          onClick={() => setShowUsage((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Toggle usage"
        >
          <Gauge className="size-4" />
          Usage
        </button>
      </div>
    )
  }

  return (
    <main className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <MobileHeader />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* History sidebar — always rendered, hidden on mobile unless drawer open */}
        <div className="hidden md:flex">
          <HistorySidebar
            conversations={conversations}
            activeId={activeId}
            onSelect={(id) => {
              setShowHistory(false)
              setActiveId(id)
            }}
            onCreate={createConversation}
            onDelete={deleteConversation}
          />
        </div>

        {/* Mobile history drawer overlay */}
        {showHistory && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="flex-1 bg-black/40"
              onClick={() => setShowHistory(false)}
            />
            <div className="w-72 shrink-0">
              <HistorySidebar
                conversations={conversations}
                activeId={activeId}
                onSelect={(id) => {
                  setShowHistory(false)
                  setActiveId(id)
                }}
                onCreate={createConversation}
                onDelete={deleteConversation}
              />
            </div>
          </div>
        )}

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

        {/* Usage sidebar — always rendered, hidden on mobile unless drawer open */}
        <div className="hidden md:flex">
          <UsageSidebar
            activeMessages={activeConversation?.messages ?? []}
            sessionTotal={sessionTotal}
            sessionCost={sessionCost}
            conversationCount={conversations.length}
          />
        </div>

        {/* Mobile usage drawer overlay */}
        {showUsage && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="w-72 shrink-0 ml-auto">
              <UsageSidebar
                activeMessages={activeConversation?.messages ?? []}
                sessionTotal={sessionTotal}
                sessionCost={sessionCost}
                conversationCount={conversations.length}
              />
            </div>
            <div
              className="flex-1 bg-black/40"
              onClick={() => setShowUsage(false)}
            />
          </div>
        )}
      </div>
    </main>
  )
}
