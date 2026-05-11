"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingDown } from "lucide-react"

interface PriceData {
  id: string
  product_name: string
  store: string
  price: number
  unit: string | null
  date_recorded: string
}

interface PriceComparisonProps {
  priceData: PriceData[]
  userId: string
}

export function PriceComparison({ priceData }: PriceComparisonProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredData = priceData.filter((item) => item.product_name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Group by product name
  const groupedData: Record<string, PriceData[]> = {}
  filteredData.forEach((item) => {
    if (!groupedData[item.product_name]) {
      groupedData[item.product_name] = []
    }
    groupedData[item.product_name].push(item)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Comparison</CardTitle>
        <p className="text-sm text-muted-foreground">Compare prices across different stores</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {Object.keys(groupedData).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "No matching products found" : "Price data will appear here as you scan receipts"}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedData).map(([productName, prices]) => {
              const sortedPrices = [...prices].sort((a, b) => a.price - b.price)
              const bestPrice = sortedPrices[0]

              return (
                <div key={productName} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">{productName}</h3>
                  <div className="space-y-2">
                    {sortedPrices.map((price, index) => (
                      <div
                        key={price.id}
                        className={`flex items-center justify-between p-2 rounded ${
                          index === 0 ? "bg-emerald-50 dark:bg-emerald-950" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{price.store}</span>
                          {index === 0 && (
                            <Badge className="gap-1">
                              <TrendingDown className="h-3 w-3" />
                              Best Price
                            </Badge>
                          )}
                        </div>
                        <span className="font-medium">
                          ${price.price.toFixed(2)}
                          {price.unit && <span className="text-sm text-muted-foreground"> / {price.unit}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                  {sortedPrices.length > 1 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Save ${(sortedPrices[sortedPrices.length - 1].price - bestPrice.price).toFixed(2)} by shopping at{" "}
                      {bestPrice.store}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
