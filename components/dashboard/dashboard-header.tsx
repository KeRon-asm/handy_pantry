"use client"

import { useEffect, useState, type ReactNode } from "react"
import { format } from "date-fns"
import { motion, MotionConfig } from "motion/react"
import type { PantryStats } from "@/lib/pantry-stats"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  displayName: string
  email?: string
  stats: Pick<PantryStats, "totalItems" | "expired" | "expiringSoon" | "lowStock">
}

function getGreeting(hour: number) {
  if (hour < 5) return "Up late"
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export function DashboardHeader({ displayName, stats }: DashboardHeaderProps) {
  // The greeting and date depend on the visitor's local clock, which the server
  // doesn't know. Render a neutral fallback first and fill them in after mount
  // so server and client HTML match (no hydration warning).
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const greeting = now ? getGreeting(now.getHours()) : "Welcome back"

  const { totalItems, expired, expiringSoon, lowStock } = stats
  const segments: { text: string; className: string }[] = []
  if (expired > 0) segments.push({ text: `${expired} expired`, className: "text-red-600 dark:text-red-400" })
  if (expiringSoon > 0)
    segments.push({ text: `${expiringSoon} expiring this week`, className: "text-amber-600 dark:text-amber-400" })
  if (lowStock > 0) segments.push({ text: `${lowStock} low on stock`, className: "text-muted-foreground" })

  const dot = expired > 0 ? "bg-red-500" : expiringSoon > 0 ? "bg-amber-500" : "bg-primary"

  let status: ReactNode
  if (totalItems === 0) {
    status = "Your pantry is empty. Add your first item to get started."
  } else if (segments.length === 0) {
    status = "Everything is fresh and stocked. Nothing expires this week."
  } else {
    status = segments.map((segment, i) => (
      <span key={segment.text}>
        {i > 0 && <span className="text-muted-foreground"> · </span>}
        <span className={cn("font-medium", segment.className)}>{segment.text}</span>
      </span>
    ))
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="mb-4 md:mb-8">
        <p className="mb-1 h-4 text-xs font-medium uppercase tracking-wide text-muted-foreground md:text-sm">
          {now && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block">
              {format(now, "EEEE, MMMM d")}
            </motion.span>
          )}
        </p>

        <h1 className="mb-1 text-2xl font-bold text-foreground md:mb-2 md:text-3xl">
          <motion.span
            key={greeting}
            // Skip the animation for the server-rendered fallback; animate only
            // when the real time-based greeting swaps in.
            initial={now ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="inline-block"
          >
            {greeting}
          </motion.span>
          , {displayName}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex items-center gap-2 text-sm text-muted-foreground md:text-base"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:hidden", dot)} />
            <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", dot)} />
          </span>
          <span>{status}</span>
        </motion.p>
      </div>
    </MotionConfig>
  )
}
