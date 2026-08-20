'use client'

import { useRef, useState } from 'react'
import { ArrowUp, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Composer({
  onSend,
  onStop,
  isBusy,
}: {
  onSend: (text: string) => void
  onStop: () => void
  isBusy: boolean
}) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  function submit() {
    const text = input.trim()
    if (!text || isBusy) return
    onSend(text)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur">
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="relative flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              autoGrow(e.target)
            }}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing &&
                e.keyCode !== 229
              ) {
                e.preventDefault()
                submit()
              }
            }}
            rows={1}
            placeholder="Send a message…"
            aria-label="Message"
            className="max-h-52 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
          />

          {isBusy ? (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={onStop}
              aria-label="Stop generating"
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <ArrowUp className="size-4" />
            </Button>
          )}
        </form>
        <p className="mt-2 px-1 text-center text-[11px] text-muted-foreground/60">
          Press Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  )
}
