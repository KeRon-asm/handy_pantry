"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"

interface SpendingData {
  date: string
  amount: number
  category: string
  store: string
}

interface SpendingTrendsProps {
  data: SpendingData[]
}

export function SpendingTrends({ data }: SpendingTrendsProps) {
  // Calculate current month vs previous month
  const now = new Date()
  const currentMonthStart = startOfMonth(now)
  const previousMonthStart = startOfMonth(subMonths(now, 1))
  const previousMonthEnd = endOfMonth(subMonths(now, 1))

  const currentMonthTotal = data
    .filter((item) => new Date(item.date) >= currentMonthStart)
    .reduce((sum, item) => sum + Number(item.amount), 0)

  const previousMonthTotal = data
    .filter((item) => {
      const date = new Date(item.date)
      return date >= previousMonthStart && date <= previousMonthEnd
    })
    .reduce((sum, item) => sum + Number(item.amount), 0)

  const percentageChange =
    previousMonthTotal > 0 ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 : 0

  // Find top spending stores
  const storeSpending: Record<string, number> = {}
  data.forEach((item) => {
    if (item.store) {
      storeSpending[item.store] = (storeSpending[item.store] || 0) + Number(item.amount)
    }
  })

  const topStores = Object.entries(storeSpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Find most expensive category
  const categorySpending: Record<string, number> = {}
  data
    .filter((item) => new Date(item.date) >= currentMonthStart)
    .forEach((item) => {
      categorySpending[item.category] = (categorySpending[item.category] || 0) + Number(item.amount)
    })

  const topCategory = Object.entries(categorySpending).sort(([, a], [, b]) => b - a)[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Month-over-Month</h3>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">${currentMonthTotal.toFixed(2)}</div>
              {percentageChange !== 0 && (
                <Badge variant={percentageChange > 0 ? "destructive" : "secondary"} className="gap-1">
                  {percentageChange > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : percentageChange < 0 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  {Math.abs(percentageChange).toFixed(1)}%
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs ${previousMonthTotal.toFixed(2)} last month</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Top Category</h3>
            {topCategory ? (
              <>
                <div className="text-2xl font-bold">{topCategory[0]}</div>
                <p className="text-xs text-muted-foreground mt-1">${topCategory[1].toFixed(2)} spent</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Top Stores</h3>
            <div className="space-y-2">
              {topStores.length > 0 ? (
                topStores.slice(0, 3).map(([store, amount]) => (
                  <div key={store} className="flex justify-between text-sm">
                    <span className="truncate">{store}</span>
                    <span className="font-medium">${amount.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No data</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
