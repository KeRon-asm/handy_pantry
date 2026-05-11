"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar, TrendingUp } from 'lucide-react'
import { formatDistanceToNow, differenceInDays } from "date-fns"

interface PantryItem {
  id: string
  name: string
  created_at: string
}

interface PantryLifetimeStatsProps {
  items: PantryItem[]
}

export function PantryLifetimeStats({ items }: PantryLifetimeStatsProps) {
  const calculateStats = () => {
    if (items.length === 0) {
      return {
        averageDays: 0,
        oldestItem: null,
        newestItem: null,
        totalItems: 0,
      }
    }

    const today = new Date()
    const lifetimes = items.map((item) => {
      const createdDate = new Date(item.created_at)
      return {
        name: item.name,
        days: differenceInDays(today, createdDate),
        createdDate,
      }
    })

    const averageDays = lifetimes.reduce((sum, item) => sum + item.days, 0) / lifetimes.length

    const oldest = lifetimes.reduce((max, item) => (item.days > max.days ? item : max))
    const newest = lifetimes.reduce((min, item) => (item.days < min.days ? item : min))

    return {
      averageDays: Math.round(averageDays),
      oldestItem: oldest,
      newestItem: newest,
      totalItems: items.length,
    }
  }

  const stats = calculateStats()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Clock className="h-5 w-5" />
          Pantry Lifetime
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 md:space-y-4">
          <div>
            <p className="text-xs md:text-sm text-muted-foreground">Average Item Age</p>
            <p className="text-xl md:text-2xl font-bold">{stats.averageDays} days</p>
          </div>

          {stats.oldestItem && (
            <div className="pt-2 border-t">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Oldest Item</p>
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium truncate">{stats.oldestItem.name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDistanceToNow(stats.oldestItem.createdDate, { addSuffix: true })}
                </span>
              </div>
            </div>
          )}

          {stats.newestItem && stats.newestItem.days !== stats.oldestItem?.days && (
            <div className="pt-2 border-t">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Newest Item</p>
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium truncate">{stats.newestItem.name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDistanceToNow(stats.newestItem.createdDate, { addSuffix: true })}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-primary pt-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs md:text-sm">Tracking {stats.totalItems} items</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
