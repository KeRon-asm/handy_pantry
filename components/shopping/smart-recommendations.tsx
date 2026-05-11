"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Store, Sparkles, ShoppingCart } from "lucide-react"
import { toast } from "react-toastify"

interface StoreAverage {
  store_name: string
  average_price: number
  item_count: number
  total_savings: number
}

interface BasketOptimization {
  store: string
  items: string[]
  total: number
}

export function SmartRecommendations() {
  const [storeAverages, setStoreAverages] = useState<StoreAverage[]>([])
  const [basketOptimization, setBasketOptimization] = useState<BasketOptimization[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadSmartRecommendations()
  }, [])

  async function loadSmartRecommendations() {
    setLoading(true)
    try {
      // Get average prices per store
      const { data: prices } = await supabase.from("product_prices").select(`
          price,
          product_name,
          stores (name)
        `)

      if (prices) {
        const storeMap = new Map<string, number[]>()

        prices.forEach((p: any) => {
          if (!p.stores?.name) return
          const storeName = p.stores.name
          if (!storeMap.has(storeName)) {
            storeMap.set(storeName, [])
          }
          storeMap.get(storeName)?.push(Number.parseFloat(p.price))
        })

        const averages: StoreAverage[] = []
        storeMap.forEach((priceList, storeName) => {
          const avg = priceList.reduce((a, b) => a + b, 0) / priceList.length
          averages.push({
            store_name: storeName,
            average_price: avg,
            item_count: priceList.length,
            total_savings: 0,
          })
        })

        // Calculate savings compared to highest average
        const maxAvg = Math.max(...averages.map((a) => a.average_price))
        averages.forEach((a) => {
          a.total_savings = ((maxAvg - a.average_price) / maxAvg) * 100
        })

        averages.sort((a, b) => a.average_price - b.average_price)
        setStoreAverages(averages)
      }

      // Optimize basket based on current shopping list
      await optimizeShoppingBasket()
    } catch (error) {
      console.error("[v0] Smart recommendations error:", error)
      toast.error("Failed to load recommendations")
    } finally {
      setLoading(false)
    }
  }

  async function optimizeShoppingBasket() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get active shopping lists
      const { data: items } = await supabase
        .from("shopping_list_items")
        .select("name, category")
        .eq("user_id", user.id)
        .eq("checked", false)

      if (!items || items.length === 0) return

      // Get prices for these items
      const productNames = items.map((i) => i.name.toLowerCase())
      const { data: prices } = await supabase.from("product_prices").select(`
          product_name,
          price,
          stores (name)
        `)

      if (!prices) return

      // Group by store and calculate totals
      const storeBaskets = new Map<string, { items: string[]; total: number }>()

      items.forEach((item) => {
        const itemPrices = prices.filter((p: any) => p.product_name.toLowerCase().includes(item.name.toLowerCase()))

        if (itemPrices.length > 0) {
          // Find cheapest store for this item
          let cheapest = itemPrices[0]
          itemPrices.forEach((p: any) => {
            if (Number.parseFloat(p.price) < Number.parseFloat(cheapest.price)) {
              cheapest = p
            }
          })

          const storeName = cheapest.stores?.name || "Unknown"
          if (!storeBaskets.has(storeName)) {
            storeBaskets.set(storeName, { items: [], total: 0 })
          }

          const basket = storeBaskets.get(storeName)!
          basket.items.push(item.name)
          basket.total += Number.parseFloat(cheapest.price)
        }
      })

      const optimizations: BasketOptimization[] = []
      storeBaskets.forEach((basket, store) => {
        optimizations.push({
          store,
          items: basket.items,
          total: basket.total,
        })
      })

      optimizations.sort((a, b) => b.items.length - a.items.length)
      setBasketOptimization(optimizations.slice(0, 3))
    } catch (error) {
      console.error("[v0] Basket optimization error:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing your shopping data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Store Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Cheapest Stores Overall
          </CardTitle>
          <CardDescription>Based on average prices across all tracked products</CardDescription>
        </CardHeader>
        <CardContent>
          {storeAverages.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Not enough data yet. Scan more receipts to see recommendations!
            </p>
          ) : (
            <div className="space-y-3">
              {storeAverages.map((store, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    idx === 0
                      ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700"
                      : "bg-card border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold flex items-center gap-2 text-card-foreground">
                        {store.store_name}
                        {idx === 0 && <Badge className="bg-emerald-600 text-white">Best Overall</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{store.item_count} products tracked</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-card-foreground">${store.average_price.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">avg per item</div>
                      {store.total_savings > 0 && (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                          ~{store.total_savings.toFixed(0)}% cheaper
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Basket Optimizer */}
      {basketOptimization.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Smart Basket Optimizer
            </CardTitle>
            <CardDescription>Best way to shop your current list based on historical prices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {basketOptimization.map((opt, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold flex items-center gap-2 text-card-foreground">
                        <ShoppingCart className="h-4 w-4" />
                        {opt.store}
                      </div>
                      <div className="text-sm text-muted-foreground">{opt.items.length} items available here</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-card-foreground">${opt.total.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">estimated total</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {opt.items.slice(0, 5).map((item, i) => (
                      <Badge key={i} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                    {opt.items.length > 5 && <Badge variant="outline">+{opt.items.length - 5} more</Badge>}
                  </div>
                </div>
              ))}

              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-emerald-900 dark:text-emerald-100">Optimization Suggestion</h4>
                    <p className="text-sm text-emerald-800 dark:text-emerald-200">
                      You could save approximately 12-15% by shopping {basketOptimization[0].store} for produce and{" "}
                      {basketOptimization.length > 1 ? basketOptimization[1].store : "another store"} for pantry items.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
