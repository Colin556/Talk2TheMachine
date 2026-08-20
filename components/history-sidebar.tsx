'use client'

import { MessageSquarePlus, Sparkles, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { totalTokensOf } from '@/lib/use-conversations'
import type { Conversation } from '@/lib/types'

function formatRelative(ts: number) {
  const diff = Date.now() - ts
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export function HistorySidebar({
  conversations,
  activeId,
  onSelect,
  onCreate,
  onDelete,
}: {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
}) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2 px-5 py-4">
        <span className="flex size-7 items-center justify-center rounded-md bg-sidebar-primary/15">
          <Sparkles className="size-4 text-sidebar-primary" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">
            Token Console
          </p>
          <p className="text-[11px] text-sidebar-foreground/50">
            Groq chat playground
          </p>
        </div>
      </div>

      <div className="px-3">
        <Button
          onClick={onCreate}
          variant="outline"
          className="w-full justify-start bg-sidebar-accent/40"
        >
          <MessageSquarePlus className="size-4" />
          New conversation
        </Button>
      </div>

      <div className="mt-4 px-5 pb-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-sidebar-foreground/40">
          History
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Conversation history">
        {conversations.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-sidebar-foreground/40">
            No conversations yet. Start a new chat to see it here.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {conversations.map((c) => {
              const isActive = c.id === activeId
              return (
                <li key={c.id}>
                  <div
                    className={`group flex items-center gap-1 rounded-lg px-1 transition-colors ${
                      isActive
                        ? 'bg-sidebar-accent'
                        : 'hover:bg-sidebar-accent/50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(c.id)}
                      className="flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-lg px-2 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <span
                        className={`w-full truncate text-sm ${
                          isActive
                            ? 'font-medium text-sidebar-foreground'
                            : 'text-sidebar-foreground/80'
                        }`}
                      >
                        {c.title}
                      </span>
                      <span className="flex w-full items-center gap-1.5 text-[11px] text-sidebar-foreground/40">
                        <span>{formatRelative(c.updatedAt)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {totalTokensOf(c).toLocaleString('en-US')} tok
                        </span>
                      </span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete "${c.title}"`}
                      onClick={() => onDelete(c.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </nav>
    </aside>
  )
}
