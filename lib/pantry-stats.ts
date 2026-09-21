export interface StatsItem {
  quantity: number | string
  price?: number | string | null
  expiration_date: string | null
}

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
    (item) => item.expiration_date && new Date(item.expiration_date) < now,
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
