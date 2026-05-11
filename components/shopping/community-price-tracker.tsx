"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingDown, TrendingUp, Calendar, MapPin } from "lucide-react"
import { toast } from "react-toastify"

interface CommunityPrice {
  product_name: string
  store_name: string
  average_price: number
  min_price: number
  max_price: number
  price_count: number
  last_updated: string
  unit: string
}

export function CommunityPriceTracker() {
  const [communityPrices, setCommunityPrices] = useState<CommunityPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadCommunityPrices()
  }, [])

  async function loadCommunityPrices() {
    setLoading(true)
    try {
      const { data: prices, error } = await supabase
        .from("product_prices")
        .select(
          `
          product_name,
          price,
          unit,
          last_updated,
          stores (
            name,
            city,
            state
          )
        `,
        )
        .order("last_updated", { ascending: false })

      if (error) throw error

      if (prices) {
        // Group by product and store
        const grouped = new Map<string, any[]>()

        prices.forEach((p: any) => {
          if (!p.stores) return
          const key = `${p.product_name}|${p.stores.name}`
          if (!grouped.has(key)) {
            grouped.set(key, [])
          }
          grouped.get(key)?.push({
            price: Number.parseFloat(p.price),
            unit: p.unit,
            last_updated: p.last_updated,
            store_name: p.stores.name,
            location: `${p.stores.city}, ${p.stores.state}`,
          })
        })

        // Calculate aggregates
        const aggregated: CommunityPrice[] = []
        grouped.forEach((priceList, key) => {
          const [product_name, store_name] = key.split("|")
          const prices = priceList.map((p) => p.price)
          const average = prices.reduce((a, b) => a + b, 0) / prices.length
          const min = Math.min(...prices)
          const max = Math.max(...prices)

          aggregated.push({
            product_name,
            store_name,
            average_price: average,
            min_price: min,
            max_price: max,
            price_count: prices.length,
            last_updated: priceList[0].last_updated,
            unit: priceList[0].unit,
          })
        })

        // Sort by most reported
        aggregated.sort((a, b) => b.price_count - a.price_count)

        setCommunityPrices(aggregated)
      }
    } catch (error) {
      console.error("[v0] Community prices error:", error)
      toast.error("Failed to load community prices")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading community prices...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Price Data
          </CardTitle>
          <CardDescription>
            Aggregated price information from all users. Prices are averaged across multiple reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {communityPrices.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground">No community price data yet. Scan receipts to contribute!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {communityPrices.slice(0, 20).map((item, idx) => {
                const priceVariance = item.max_price - item.min_price
                const hasVariance = priceVariance > 0.5

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedProduct(selectedProduct === item.product_name ? null : item.product_name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {item.product_name}
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Users className="h-3 w-3" />
                            {item.price_count} report{item.price_count > 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3" />
                          {item.store_name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          ${item.average_price.toFixed(2)}
                          <span className="text-xs text-muted-foreground font-normal">/{item.unit}</span>
                        </div>
                        {hasVariance && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            {item.min_price < item.average_price ? (
                              <TrendingDown className="h-3 w-3 text-green-600" />
                            ) : (
                              <TrendingUp className="h-3 w-3 text-red-600" />
                            )}
                            ${item.min_price.toFixed(2)} - ${item.max_price.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedProduct === item.product_name && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center p-2 rounded bg-muted">
                            <div className="text-xs text-muted-foreground mb-1">Lowest</div>
                            <div className="font-semibold text-green-600">${item.min_price.toFixed(2)}</div>
                          </div>
                          <div className="text-center p-2 rounded bg-muted">
                            <div className="text-xs text-muted-foreground mb-1">Average</div>
                            <div className="font-semibold">${item.average_price.toFixed(2)}</div>
                          </div>
                          <div className="text-center p-2 rounded bg-muted">
                            <div className="text-xs text-muted-foreground mb-1">Highest</div>
                            <div className="font-semibold text-red-600">${item.max_price.toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Last updated: {new Date(item.last_updated).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {communityPrices.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium">How Community Pricing Works</h4>
                <p className="text-sm text-muted-foreground">
                  Every time you scan a receipt, the prices are anonymously added to the community database. This helps
                  everyone get better price insights and find the best deals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
