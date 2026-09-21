import Link from "next/link"
import { AlertTriangle, Package, TrendingDown, Wallet, type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { CountUp } from "@/components/ui/count-up"
import { HoverIcon } from "@/components/ui/hover-icon"
import { AnimatedGrid } from "@/components/dashboard/animated-grid"
import type { PantryStats } from "@/lib/pantry-stats"
import { cn } from "@/lib/utils"

type Tone = "primary" | "amber" | "red"

const TONES: Record<Tone, { badge: string; caption: string }> = {
  primary: { badge: "bg-primary/10 text-primary", caption: "text-muted-foreground" },
  amber: { badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400", caption: "text-amber-600 dark:text-amber-400" },
  red: { badge: "bg-red-500/10 text-red-600 dark:text-red-400", caption: "text-red-600 dark:text-red-400" },
}

interface Tile {
  key: string
  label: string
  href: string
  icon: LucideIcon
  tone: Tone
  value: number
  decimals?: number
  prefix?: string
  caption: string
}

interface PantryOverviewProps {
  stats: PantryStats
}

export function PantryOverview({ stats }: PantryOverviewProps) {
  const expiringTotal = stats.expired + stats.expiringSoon

  const tiles: Tile[] = [
    {
      key: "items",
      label: "Items",
      href: "/dashboard/pantry",
      icon: Package,
      tone: "primary",
      value: stats.totalItems,
      caption: `Total quantity: ${Math.round(stats.totalQuantity).toLocaleString("en-US")}`,
    },
    {
      key: "expiring",
      label: "Expiring Soon",
      href: "/dashboard/pantry",
      icon: AlertTriangle,
      tone: stats.expired > 0 ? "red" : expiringTotal > 0 ? "amber" : "primary",
      value: expiringTotal,
      caption: stats.expired > 0 ? `${stats.expired} already expired` : expiringTotal > 0 ? "Within 7 days" : "All fresh",
    },
    {
      key: "low",
      label: "Low Stock",
      href: "/dashboard/shopping",
      icon: TrendingDown,
      tone: stats.lowStock > 0 ? "amber" : "primary",
      value: stats.lowStock,
      caption: stats.lowStock > 0 ? "Quantity under 2" : "Well stocked",
    },
    {
      key: "value",
      label: "Pantry Value",
      href: "/dashboard/budget",
      icon: Wallet,
      tone: "primary",
      value: stats.pantryValue,
      decimals: 2,
      prefix: "$",
      caption: stats.totalItems > 0 ? `${stats.pricedItems} of ${stats.totalItems} items priced` : "Add items to track value",
    },
  ]

  return (
    <AnimatedGrid className="mb-3 md:mb-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4" stagger={0.08}>
      {tiles.map((tile, index) => {
        const tone = TONES[tile.tone]
        const Icon = tile.icon
        return (
          <Link
            key={tile.key}
            href={tile.href}
            className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <Card className="h-full gap-3 py-4 md:py-5">
              <CardContent className="px-4 md:px-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs md:text-sm text-muted-foreground">{tile.label}</p>
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tone.badge)}>
                    <HoverIcon>
                      <Icon className="h-4 w-4" />
                    </HoverIcon>
                  </span>
                </div>
                <p className="mt-2 text-2xl md:text-3xl font-bold tabular-nums">
                  <CountUp
                    value={tile.value}
                    decimals={tile.decimals}
                    prefix={tile.prefix}
                    delay={0.15 + index * 0.08}
                  />
                </p>
                <p className={cn("mt-1 text-xs", tone.caption)}>{tile.caption}</p>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </AnimatedGrid>
  )
}
