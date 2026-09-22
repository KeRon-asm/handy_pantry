"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { Boxes } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CHART_COLOR_COUNT, type CategorySlice } from "@/lib/pantry-stats"
import { cn } from "@/lib/utils"

interface CategoryDonutProps {
  breakdown: CategorySlice[]
}

/**
 * Donut chart of pantry items by category. Hovering a slice (or its legend
 * row) highlights it and shows its name/count in the center; clicking either
 * jumps to the pantry page pre-filtered to that category via a `?category=`
 * query param (read by PantryList).
 */
export function CategoryDonut({ breakdown }: CategoryDonutProps) {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const totalItems = useMemo(() => breakdown.reduce((sum, slice) => sum + slice.count, 0), [breakdown])

  const data = useMemo(
    () =>
      breakdown.map((slice, index) => ({
        ...slice,
        color: `var(--chart-${(index % CHART_COLOR_COUNT) + 1})`,
      })),
    [breakdown],
  )

  const goToCategory = (category: string) => {
    router.push(`/dashboard/pantry?category=${encodeURIComponent(category)}`)
  }

  const active = activeIndex !== null ? data[activeIndex] : null

  if (totalItems === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">By Category</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <Boxes className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Add items to see your pantry broken down by category.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">By Category</CardTitle>
        <p className="text-sm text-muted-foreground">Hover a slice, or click to jump to that filter</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="relative mx-auto h-[200px] w-[200px] shrink-0 md:h-[220px] md:w-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="category"
                  innerRadius="62%"
                  outerRadius="100%"
                  paddingAngle={data.length > 1 ? 2 : 0}
                  stroke="none"
                  isAnimationActive
                  animationDuration={700}
                  animationEasing="ease-out"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={(entry) => goToCategory(entry.category as string)}
                >
                  {data.map((slice, index) => (
                    <Cell
                      key={slice.category}
                      fill={slice.color}
                      style={{
                        cursor: "pointer",
                        opacity: activeIndex === null || activeIndex === index ? 1 : 0.35,
                        transition: "opacity 150ms ease",
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label: hovered slice, or the grand total by default. */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4">
              <p className="text-2xl font-bold tabular-nums md:text-3xl">{active ? active.count : totalItems}</p>
              <p className="max-w-[120px] truncate text-center text-xs text-muted-foreground">
                {active ? active.category : totalItems === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-0.5 sm:grid-cols-2">
            {data.map((slice, index) => (
              <button
                key={slice.category}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => goToCategory(slice.category)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring/60",
                  activeIndex === index ? "bg-muted" : "hover:bg-muted/60",
                )}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                <span className="flex-1 truncate">{slice.category}</span>
                <span className="text-muted-foreground tabular-nums">{slice.count}</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
