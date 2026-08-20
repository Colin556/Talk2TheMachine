'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ChatUIMessage, Conversation } from '@/lib/types'

const STORAGE_KEY = 'token-console:conversations'

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function loadFromStorage(): Conversation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Conversation[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

/** Derive a short title from the first user message. */
export function deriveTitle(messages: ChatUIMessage[]): string {
  const firstUser = messages.find((m) => m.role === 'user')
  if (!firstUser) return 'New conversation'
  const text = firstUser.parts
    .filter((p) => p.type === 'text')
    .map((p) => (p as { text: string }).text)
    .join(' ')
    .trim()
  if (!text) return 'New conversation'
  return text.length > 42 ? `${text.slice(0, 42)}…` : text
}

export function totalTokensOf(conversation: Conversation): number {
  return conversation.messages.reduce(
    (sum, m) => sum + (m.metadata?.totalTokens ?? 0),
    0,
  )
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const stored = loadFromStorage()
    setConversations(stored)
    setActiveId(stored[0]?.id ?? null)
    setHydrated(true)
  }, [])

  // Persist whenever conversations change (after hydration).
  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    } catch {
      // storage may be full or unavailable; ignore
    }
  }, [conversations, hydrated])

  const createConversation = useCallback(() => {
    const now = Date.now()
    const conversation: Conversation = {
      id: createId(),
      title: 'New conversation',
      createdAt: now,
      updatedAt: now,
      messages: [],
    }
    setConversations((prev) => [conversation, ...prev])
    setActiveId(conversation.id)
    return conversation
  }, [])

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id)
        setActiveId((current) => {
          if (current !== id) return current
          return next[0]?.id ?? null
        })
        return next
      })
    },
    [],
  )

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, title: title.trim() || c.title } : c,
      ),
    )
  }, [])

  /** Replace a conversation's messages and bump its title/timestamp. */
  const saveMessages = useCallback(
    (id: string, messages: ChatUIMessage[]) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          const autoTitle =
            c.title === 'New conversation' ? deriveTitle(messages) : c.title
          return {
            ...c,
            messages,
            title: autoTitle,
            updatedAt: Date.now(),
          }
        }),
      )
    },
    [],
  )

  const activeConversation =
    conversations.find((c) => c.id === activeId) ?? null

  return {
    hydrated,
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    createConversation,
    deleteConversation,
    renameConversation,
    saveMessages,
  }
}
