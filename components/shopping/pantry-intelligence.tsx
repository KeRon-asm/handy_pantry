"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, AlertCircle, TrendingDown, Calendar, Bell, TrendingUp, CheckCircle } from 'lucide-react'
import { toast } from "react-toastify"

interface RestockPrediction {
  item_name: string
  category: string
  current_quantity: number
  days_until_out: number
  best_store: string
  best_price: number
  savings_potential: number
}

interface PantryInsight {
  type: 'healthy' | 'suggestion' | 'warning'
  title: string
  message: string
  icon: any
}

interface PantryIntelligenceProps {
  initialPantryItems: any[]
  userId: string
}

export function PantryIntelligence({ initialPantryItems, userId }: PantryIntelligenceProps) {
  const [predictions, setPredictions] = useState<RestockPrediction[]>([])
  const [insights, setInsights] = useState<PantryInsight[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadPredictions(initialPantryItems)
  }, [initialPantryItems])

  async function loadPredictions(pantryItems: any[]) {
    setLoading(true)
    try {
      if (!pantryItems || pantryItems.length === 0) {
        setInsights([{
          type: 'suggestion',
          title: 'Start Building Your Pantry',
          message: 'Add items to your pantry by scanning receipts or manually adding items to get AI-powered insights and recommendations!',
          icon: Brain
        }])
        setLoading(false)
        return
      }

      await generatePantryInsights(pantryItems)

      const predictionsList: RestockPrediction[] = []

      for (const item of pantryItems) {
        const expiryDate = item.expiration_date ? new Date(item.expiration_date) : null
        const daysUntilExpiry = expiryDate
          ? Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : 999

        if (item.quantity <= 2 || daysUntilExpiry <= 7) {
          const { data: prices } = await supabase
            .from("product_prices")
            .select(`
              price,
              stores (name)
            `)
            .ilike("product_name", `%${item.name}%`)
            .order("price", { ascending: true })
            .limit(3)

          if (prices && prices.length > 0) {
            const bestPrice = Number.parseFloat(prices[0].price)
            const avgPrice = prices.reduce((sum, p) => sum + Number.parseFloat(p.price), 0) / prices.length
            const savings = ((avgPrice - bestPrice) / avgPrice) * 100

            predictionsList.push({
              item_name: item.name,
              category: item.category || "Other",
              current_quantity: item.quantity || 0,
              days_until_out: daysUntilExpiry,
              best_store: prices[0].stores?.name || "Unknown",
              best_price: bestPrice,
              savings_potential: savings,
            })
          }
        }
      }

      predictionsList.sort((a, b) => a.days_until_out - b.days_until_out)
      setPredictions(predictionsList)
    } catch (error) {
      console.error("[v0] Pantry intelligence error:", error)
      toast.error("Failed to load predictions")
    } finally {
      setLoading(false)
    }
  }

  async function generatePantryInsights(pantryItems: any[]) {
    try {
      const insightsList: PantryInsight[] = []
      
      const categories = new Set(pantryItems.map(item => item.category || 'Other'))
      const totalItems = pantryItems.length
      const totalQuantity = pantryItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
      
      if (totalItems >= 10 && categories.size >= 4) {
        insightsList.push({
          type: 'healthy',
          title: 'Well-Balanced Pantry',
          message: `You have ${totalItems} items across ${categories.size} categories. Your pantry shows good variety!`,
          icon: CheckCircle
        })
      }
      
      if (categories.size <= 2 && totalItems > 5) {
        insightsList.push({
          type: 'warning',
          title: 'Limited Variety',
          message: `Most items are in ${Array.from(categories).join(' and ')}. Consider adding more diverse foods.`,
          icon: AlertCircle
        })
      }
      
      const expiringItems = pantryItems.filter(item => {
        if (!item.expiration_date) return false
        const days = Math.ceil((new Date(item.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return days <= 7 && days > 0
      })
      
      if (expiringItems.length > 0) {
        insightsList.push({
          type: 'warning',
          title: 'Items Expiring Soon',
          message: `${expiringItems.length} items expiring this week. Plan meals to use: ${expiringItems.slice(0, 3).map(i => i.name).join(', ')}`,
          icon: Calendar
        })
      }
      
      const wellStocked = pantryItems.filter(item => item.quantity >= 3)
      if (wellStocked.length >= totalItems * 0.8) {
        insightsList.push({
          type: 'healthy',
          title: 'Great Stock Levels',
          message: `${Math.round((wellStocked.length / totalItems) * 100)}% of your pantry is well-stocked. You're prepared for the week!`,
          icon: TrendingUp
        })
      }
      
      const hasProteins = pantryItems.some(item => 
        ['meat', 'protein', 'dairy', 'eggs'].includes(item.category?.toLowerCase() || '')
      )
      const hasVegetables = pantryItems.some(item => 
        ['vegetables', 'produce', 'greens'].includes(item.category?.toLowerCase() || '')
      )
      
      if (!hasProteins && totalItems > 3) {
        insightsList.push({
          type: 'suggestion',
          title: 'Add Protein Sources',
          message: 'Your pantry is low on proteins. Consider adding eggs, chicken, or plant-based proteins.',
          icon: TrendingDown
        })
      }
      
      if (!hasVegetables && totalItems > 3) {
        insightsList.push({
          type: 'suggestion',
          title: 'More Fresh Produce',
          message: 'Adding vegetables will improve meal variety and nutrition. Try leafy greens or root vegetables.',
          icon: TrendingDown
        })
      }
      
      if (insightsList.length === 0) {
        insightsList.push({
          type: 'healthy',
          title: 'Pantry Looking Good',
          message: `You have ${totalItems} items tracked. Keep scanning receipts to get smarter insights!`,
          icon: Brain
        })
      }
      
      setInsights(insightsList)
    } catch (error) {
      console.error('[v0] Failed to generate insights:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing your pantry...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Pantry Analysis
            </CardTitle>
            <CardDescription>Smart insights about your current inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, idx) => {
                const Icon = insight.icon
                const colorClasses = {
                  healthy: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100',
                  warning: 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100',
                  suggestion: 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100'
                }
                
                return (
                  <div key={idx} className={`p-4 rounded-lg border ${colorClasses[insight.type]}`}>
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{insight.title}</h4>
                        <p className="text-sm opacity-90">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Restock Predictions
          </CardTitle>
          <CardDescription>Items you'll need to buy soon with best prices</CardDescription>
        </CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 mx-auto text-emerald-500 opacity-50 mb-4" />
              <p className="text-muted-foreground">
                No items need restocking right now. We'll notify you when it's time to shop!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.map((pred, idx) => {
                const isUrgent = pred.days_until_out <= 3
                const isLowStock = pred.current_quantity <= 1

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      isUrgent || isLowStock
                        ? "bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-700"
                        : "bg-card border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-card-foreground">{pred.item_name}</span>
                          {(isUrgent || isLowStock) && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {isLowStock ? "Low Stock" : "Expiring Soon"}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {pred.days_until_out <= 7
                              ? `Expires in ${pred.days_until_out} days`
                              : `Current: ${pred.current_quantity} ${pred.category}`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-sm font-medium text-foreground">Best Deal</span>
                        </div>
                        <Badge variant="secondary">{pred.best_store}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-foreground">${pred.best_price.toFixed(2)}</span>
                        {pred.savings_potential > 5 && (
                          <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                            Save {pred.savings_potential.toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <Button size="sm" className="w-full bg-transparent" variant="outline">
                        <Bell className="h-4 w-4 mr-2" />
                        Remind Me to Buy
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
