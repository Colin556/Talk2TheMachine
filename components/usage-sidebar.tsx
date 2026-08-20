'use client'

import { ArrowDownLeft, ArrowUpRight, Coins, Cpu, Gauge } from 'lucide-react'
import { CHAT_MODEL, type ChatUIMessage } from '@/lib/types'

type Usage = {
  input: number
  output: number
  total: number
}

function sumUsage(messages: ChatUIMessage[]): Usage {
  return messages.reduce<Usage>(
    (acc, m) => {
      const md = m.metadata
      if (!md) return acc
      return {
        input: acc.input + (md.inputTokens ?? 0),
        output: acc.output + (md.outputTokens ?? 0),
        total: acc.total + (md.totalTokens ?? 0),
      }
    },
    { input: 0, output: 0, total: 0 },
  )
}

function formatNumber(n: number) {
  return n.toLocaleString('en-US')
}

function formatUsd(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  })
}

function StatRow({
  icon,
  label,
  value,
  accentClass,
}: {
  icon: React.ReactNode
  label: string
  value: number
  accentClass: string
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5">
        <span
          className={`flex size-7 items-center justify-center rounded-md ${accentClass}`}
        >
          {icon}
        </span>
        <span className="text-sm text-sidebar-foreground/70">{label}</span>
      </div>
      <span className="font-mono text-sm tabular-nums text-sidebar-foreground">
        {formatNumber(value)}
      </span>
    </div>
  )
}

export function UsageSidebar({
  activeMessages,
  sessionTotal,
  sessionCost,
  conversationCount,
}: {
  activeMessages: ChatUIMessage[]
  sessionTotal: number
  sessionCost: number
  conversationCount: number
}) {
  const usage = sumUsage(activeMessages)
  const convoCost = activeMessages.reduce(
    (sum, m) => sum + (m.metadata?.costUsd ?? 0),
    0,
  )
  const assistantTurns = activeMessages.filter(
    (m) => m.role === 'assistant' && (m.metadata?.totalTokens ?? 0) > 0,
  ).length
  const avgPerTurn =
    assistantTurns > 0 ? Math.round(usage.total / assistantTurns) : 0
  const avgLatencyMs =
    assistantTurns > 0
      ? Math.round(
          activeMessages.reduce(
            (sum, m) => sum + (m.metadata?.responseTimeMs ?? 0),
            0,
          ) / assistantTurns,
        )
      : 0

  // Ratio bar between input and output tokens for the active conversation.
  const denom = usage.input + usage.output
  const inputPct = denom > 0 ? (usage.input / denom) * 100 : 0

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-4">
        <Gauge className="size-4 text-sidebar-primary" />
        <h2 className="text-sm font-semibold text-sidebar-foreground">
          Token Usage
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Headline total for the active conversation */}
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-sidebar-foreground/50">
            This conversation
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-sidebar-foreground">
            {formatNumber(usage.total)}
          </p>
          <p className="mt-0.5 text-xs text-sidebar-foreground/50">
            total tokens
          </p>

          {/* Input / output ratio bar */}
          <div className="mt-4">
            <div className="flex h-2 overflow-hidden rounded-full bg-sidebar-border">
              <div
                className="h-full bg-chart-2"
                style={{ width: `${inputPct}%` }}
                aria-hidden="true"
              />
              <div className="h-full flex-1 bg-sidebar-primary" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-sidebar-foreground/50">
              <span>Input {formatNumber(usage.input)}</span>
              <span>Output {formatNumber(usage.output)}</span>
            </div>
          </div>
        </div>

        {/* Detailed breakdown */}
        <div className="mt-2 divide-y divide-sidebar-border/60">
          <StatRow
            icon={<ArrowDownLeft className="size-4 text-chart-2" />}
            label="Input tokens"
            value={usage.input}
            accentClass="bg-chart-2/15"
          />
          <StatRow
            icon={<ArrowUpRight className="size-4 text-sidebar-primary" />}
            label="Output tokens"
            value={usage.output}
            accentClass="bg-sidebar-primary/15"
          />
          <StatRow
            icon={<Coins className="size-4 text-sidebar-foreground/70" />}
            label="Avg / response"
            value={avgPerTurn}
            accentClass="bg-sidebar-accent"
          />
          <StatRow
            icon={<Gauge className="size-4 text-sidebar-primary" />}
            label="Avg latency (ms)"
            value={avgLatencyMs}
            accentClass="bg-sidebar-primary/15"
          />
        </div>

        <div className="mt-5 rounded-xl border border-sidebar-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-sidebar-foreground/50">
            Estimated cost
          </p>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-sidebar-foreground/60">This conversation</span>
              <span className="font-mono text-sidebar-foreground">
                {formatUsd(convoCost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sidebar-foreground/60">Session total</span>
              <span className="font-mono text-sidebar-foreground">
                {formatUsd(sessionCost)}
              </span>
            </div>
          </div>
        </div>

        {/* Session-wide total across all conversations */}
        <div className="mt-5 rounded-xl border border-sidebar-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-sidebar-foreground/50">
            All conversations
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-xl font-semibold tabular-nums text-sidebar-foreground">
              {formatNumber(sessionTotal)}
            </span>
            <span className="text-xs text-sidebar-foreground/50">
              {conversationCount} thread{conversationCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-sidebar-border px-5 py-3">
        <Cpu className="size-3.5 text-sidebar-foreground/40" />
        <span className="truncate font-mono text-[11px] text-sidebar-foreground/40">
          {CHAT_MODEL} · groq
        </span>
      </div>
    </aside>
  )
}
