"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Calendar, TrendingUp } from 'lucide-react'
import { differenceInDays, format } from "date-fns"

interface Receipt {
  id: string
  purchase_date: string
  store: string
}

interface ShoppingFrequencyProps {
  receipts: Receipt[]
}

export function ShoppingFrequency({ receipts }: ShoppingFrequencyProps) {
  const calculateFrequency = () => {
    if (receipts.length === 0) {
      return {
        averageDays: 0,
        totalTrips: 0,
        lastShoppingDate: null,
        nextPredictedDate: null,
        frequencyLabel: "No data yet",
      }
    }

    // Sort receipts by date
    const sortedReceipts = [...receipts].sort(
      (a, b) => new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime()
    )

    const totalTrips = sortedReceipts.length
    const lastShoppingDate = new Date(sortedReceipts[sortedReceipts.length - 1].purchase_date)

    if (sortedReceipts.length < 2) {
      return {
        averageDays: 0,
        totalTrips,
        lastShoppingDate,
        nextPredictedDate: null,
        frequencyLabel: "Need more data",
      }
    }

    // Calculate days between each shopping trip
    const daysBetweenTrips = []
    for (let i = 1; i < sortedReceipts.length; i++) {
      const prevDate = new Date(sortedReceipts[i - 1].purchase_date)
      const currDate = new Date(sortedReceipts[i].purchase_date)
      const days = differenceInDays(currDate, prevDate)
      if (days > 0) daysBetweenTrips.push(days)
    }

    const averageDays = Math.round(
      daysBetweenTrips.reduce((sum, days) => sum + days, 0) / daysBetweenTrips.length
    )

    // Predict next shopping date
    const nextPredictedDate = new Date(lastShoppingDate)
    nextPredictedDate.setDate(nextPredictedDate.getDate() + averageDays)

    // Determine frequency label
    let frequencyLabel = "Every few days"
    if (averageDays >= 30) frequencyLabel = "Monthly"
    else if (averageDays >= 14) frequencyLabel = "Bi-weekly"
    else if (averageDays >= 7) frequencyLabel = "Weekly"
    else if (averageDays >= 3) frequencyLabel = "Twice a week"

    return {
      averageDays,
      totalTrips,
      lastShoppingDate,
      nextPredictedDate,
      frequencyLabel,
    }
  }

  const stats = calculateFrequency()
  const daysSinceLastShop = stats.lastShoppingDate
    ? differenceInDays(new Date(), stats.lastShoppingDate)
    : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <ShoppingCart className="h-5 w-5" />
          Shopping Frequency
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 md:space-y-4">
          <div>
            <p className="text-xs md:text-sm text-muted-foreground">Average Frequency</p>
            <p className="text-xl md:text-2xl font-bold">
              {stats.averageDays > 0 ? `Every ${stats.averageDays} days` : stats.frequencyLabel}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stats.frequencyLabel}</p>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs md:text-sm text-muted-foreground">Last Shopping Trip</p>
            <p className="text-sm font-medium">
              {stats.lastShoppingDate ? format(stats.lastShoppingDate, "MMM d, yyyy") : "Never"}
            </p>
            {daysSinceLastShop > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">{daysSinceLastShop} days ago</p>
            )}
          </div>

          {stats.nextPredictedDate && (
            <div className="pt-2 border-t">
              <p className="text-xs md:text-sm text-muted-foreground">Next Predicted Trip</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{format(stats.nextPredictedDate, "MMM d, yyyy")}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-primary pt-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs md:text-sm">{stats.totalTrips} shopping trips tracked</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
