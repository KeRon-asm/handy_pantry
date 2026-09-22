"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion, MotionConfig } from "motion/react"
import { AlertTriangle, Check, ChefHat, PartyPopper } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { ExpirationAlert, ExpirationUrgency } from "@/lib/pantry-stats"
import { cn } from "@/lib/utils"

/** The full pantry_items row, so "Undo" can re-insert exactly what was removed. */
interface PantryItemRow {
  id: string
  name: string
  quantity: number
  unit: string
  expiration_date: string | null
  [key: string]: unknown
}

type AlertItem = ExpirationAlert<PantryItemRow>

const URGENCY_STYLES: Record<ExpirationUrgency, { pill: string; badge: string; icon: string }> = {
  expired: {
    pill: "bg-red-500/10 text-red-600 dark:text-red-400",
    badge: "bg-red-500/15 text-red-600 dark:text-red-400",
    icon: "text-red-500",
  },
  critical: {
    pill: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    badge: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    icon: "text-orange-500",
  },
  warning: {
    pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    icon: "text-amber-500",
  },
  notice: {
    pill: "bg-muted text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
    icon: "text-muted-foreground",
  },
}

const VISIBLE_LIMIT = 5

interface ExpirationAlertsProps {
  items: AlertItem[]
}

/**
 * Dashboard card for items expiring soon. Each row shows a color-coded
 * urgency pill and a days-left badge, plus two actions: "Use in recipe"
 * (jumps to the recipe generator with this item pre-filled) and "Mark used"
 * (deletes the pantry row, animates the row out, and offers an Undo toast
 * that re-inserts the exact row if clicked).
 *
 * `items` arrives already enriched by `getExpirationAlerts` on the server —
 * this component never computes a date or "now" itself, so it can't produce
 * the server/client hydration mismatches documented elsewhere in this app.
 */
export function ExpirationAlerts({ items }: ExpirationAlertsProps) {
  const router = useRouter()
  const [alerts, setAlerts] = useState(items)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const hadItemsInitially = items.length > 0

  const setPending = (id: string, isPending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev)
      if (isPending) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleUseInRecipe = (item: AlertItem) => {
    router.push(`/dashboard/recipes?use=${encodeURIComponent(item.name)}`)
  }

  const handleMarkUsed = async (item: AlertItem) => {
    if (pendingIds.has(item.id)) return
    setPending(item.id, true)

    // Optimistic removal — AnimatePresence below animates the row out.
    setAlerts((prev) => prev.filter((a) => a.id !== item.id))

    const supabase = createClient()
    const { error } = await supabase.from("pantry_items").delete().eq("id", item.id)
    setPending(item.id, false)

    if (error) {
      // Put it back: the delete never happened.
      setAlerts((prev) => [...prev, item].sort((a, b) => a.daysUntil - b.daysUntil))
      toast.error(`Couldn't mark "${item.name}" as used`, { description: error.message })
      return
    }

    toast(`Marked "${item.name}" as used`, {
      description: "Removed from your pantry.",
      duration: 6000,
      action: {
        label: "Undo",
        onClick: async () => {
          // Strip the derived (non-column) fields before writing the row back.
          const { daysUntil, urgency, pillLabel, ...row } = item
          const { error: insertError } = await supabase.from("pantry_items").insert(row)
          if (insertError) {
            toast.error(`Couldn't restore "${item.name}"`, { description: insertError.message })
            return
          }
          setAlerts((prev) => [...prev, item].sort((a, b) => a.daysUntil - b.daysUntil))
          toast.success(`Restored "${item.name}"`)
        },
      },
    })
  }

  const visible = alerts.slice(0, VISIBLE_LIMIT)
  const overflow = alerts.length - visible.length

  return (
    <MotionConfig reducedMotion="user">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <AlertTriangle className={cn("h-5 w-5", alerts.length > 0 ? "text-amber-600" : "text-muted-foreground")} />
            Expiration Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              {hadItemsInitially ? (
                <>
                  <PartyPopper className="h-7 w-7 text-primary" />
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs text-muted-foreground">Nothing left expiring soon.</p>
                </>
              ) : (
                <p className="text-xs md:text-sm text-muted-foreground">No items expiring soon</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {visible.map((item) => {
                  const style = URGENCY_STYLES[item.urgency]
                  const isPending = pendingIds.has(item.id)
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 32, height: 0, marginBottom: 0 }}
                      transition={{ type: "spring", stiffness: 340, damping: 30 }}
                      className="rounded-lg border p-2.5 md:p-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg text-xs font-bold tabular-nums leading-none",
                            style.badge,
                          )}
                          aria-hidden="true"
                        >
                          {item.daysUntil < 0 ? "!" : Math.abs(item.daysUntil)}
                          {item.daysUntil >= 0 && <span className="text-[9px] font-medium">days</span>}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-medium md:text-base">{item.name}</p>
                            <span
                              className={cn(
                                "shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
                                style.pill,
                              )}
                            >
                              {item.pillLabel}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} {item.unit}
                          </p>

                          <div className="mt-2 flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 flex-1 text-xs"
                              onClick={() => handleUseInRecipe(item)}
                            >
                              <ChefHat className="h-3 w-3" />
                              Use in recipe
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 flex-1 text-xs"
                              disabled={isPending}
                              onClick={() => handleMarkUsed(item)}
                            >
                              <Check className="h-3 w-3" />
                              Mark used
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {overflow > 0 && (
                <p className="pt-1 text-center text-xs text-muted-foreground">+{overflow} more expiring soon</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </MotionConfig>
  )
}
