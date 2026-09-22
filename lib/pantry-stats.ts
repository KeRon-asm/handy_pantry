import { differenceInCalendarDays, parseISO } from "date-fns"

export interface StatsItem {
  quantity: number | string
  price?: number | string | null
  expiration_date: string | null
}

export interface CategoryItem {
  category: string | null
}

export interface CategorySlice {
  category: string
  count: number
  /** Share of all items, 0-1. */
  share: number
}

/** The 11 CSS chart color slots defined in globals.css, cycled if there are more categories than colors. */
export const CHART_COLOR_COUNT = 11

export interface PantryStats {
  totalItems: number
  totalQuantity: number
  /** Items with quantity under 2 (same threshold the old overview card used). */
  lowStock: number
  /** Items already past their expiration date. */
  expired: number
  /** Items expiring within the query window that have NOT expired yet. */
  expiringSoon: number
  /** How many items have a price recorded. */
  pricedItems: number
  /** Sum of `price`. Receipts store the line total (not per-unit), so no quantity multiply. */
  pantryValue: number
}

/**
 * Calendar-day difference between a date-only string (e.g. "2026-09-22") and
 * `now`, using `parseISO` so the string is read as *local* midnight instead of
 * `new Date()`'s UTC-midnight parsing — the bug documented in the dashboard
 * header (a US viewer would otherwise see dates a day early). Negative means
 * already past.
 */
function daysUntil(expirationDate: string, now: Date): number {
  return differenceInCalendarDays(parseISO(expirationDate), now)
}

/**
 * Compute all dashboard numbers in one place so the header and the stat tiles
 * can never disagree. Call this from a server component and pass the result
 * down as plain numbers: that avoids server/client `Date` mismatches (and the
 * resulting hydration warnings) that computing "now" inside client components
 * would cause.
 *
 * `expiringItems` is the dashboard's existing "expires within 7 days, or already
 * expired" query result. "Expired" uses the same comparison as ExpirationAlerts,
 * so the two never show different numbers on the same page.
 */
export function getPantryStats(items: StatsItem[], expiringItems: StatsItem[]): PantryStats {
  const now = new Date()

  const expired = expiringItems.filter(
    (item) => item.expiration_date && daysUntil(item.expiration_date, now) < 0,
  ).length

  let pricedItems = 0
  let pantryValue = 0
  for (const item of items) {
    if (item.price === null || item.price === undefined) continue
    const price = Number(item.price)
    if (Number.isFinite(price)) {
      pricedItems += 1
      pantryValue += price
    }
  }

  return {
    totalItems: items.length,
    totalQuantity: items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    lowStock: items.filter((item) => Number(item.quantity) < 2).length,
    expired,
    expiringSoon: expiringItems.length - expired,
    pricedItems,
    pantryValue,
  }
}

/**
 * Group items by `category` for the dashboard donut. Sorted by count
 * descending so the biggest slice is always first (chart-1's color).
 * Items with a missing/blank category are grouped under "Uncategorized".
 */
export function getCategoryBreakdown(items: CategoryItem[]): CategorySlice[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    const category = item.category?.trim() || "Uncategorized"
    counts.set(category, (counts.get(category) || 0) + 1)
  }

  const total = items.length || 1
  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count, share: count / total }))
    .sort((a, b) => b.count - a.count)
}

export type ExpirationUrgency = "expired" | "critical" | "warning" | "notice"

/**
 * An expiring item enriched with everything the alerts card needs to render
 * and to act on: `daysUntil` (negative once past), an `urgency` tier for
 * color-coding, and a ready-to-display `pillLabel`. Generic over `T` so the
 * full pantry_items row (needed to re-insert on "Undo") passes straight
 * through untouched — nothing here drops fields.
 */
export type ExpirationAlert<T extends { expiration_date: string | null }> = T & {
  expiration_date: string
  daysUntil: number
  urgency: ExpirationUrgency
  pillLabel: string
}

/**
 * Enrich expiring items with a calendar-day count and urgency tier, computed
 * once on the server (like getPantryStats) so the client card never runs its
 * own `Date`/"now" logic — that's exactly the class of bug documented for the
 * dashboard header. Sorted soonest-expiring (most negative daysUntil) first.
 */
export function getExpirationAlerts<T extends { expiration_date: string | null }>(items: T[]): ExpirationAlert<T>[] {
  const now = new Date()

  return items
    .filter((item): item is T & { expiration_date: string } => Boolean(item.expiration_date))
    .map((item) => {
      const days = daysUntil(item.expiration_date, now)
      let urgency: ExpirationUrgency
      let pillLabel: string

      if (days < 0) {
        urgency = "expired"
        pillLabel = days === -1 ? "Expired yesterday" : `Expired ${Math.abs(days)}d ago`
      } else if (days === 0) {
        urgency = "critical"
        pillLabel = "Expires today"
      } else if (days === 1) {
        urgency = "critical"
        pillLabel = "Expires tomorrow"
      } else if (days <= 3) {
        urgency = "warning"
        pillLabel = `${days} days left`
      } else {
        urgency = "notice"
        pillLabel = `${days} days left`
      }

      return { ...item, daysUntil: days, urgency, pillLabel }
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
}
