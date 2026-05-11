import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingDown } from "lucide-react"

interface PantryItem {
  id: string
  name: string
  quantity: number
  expiration_date: string | null
}

interface PantryOverviewProps {
  items: PantryItem[]
}

export function PantryOverview({ items }: PantryOverviewProps) {
  const totalItems = items.length
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity), 0)
  const lowStockItems = items.filter((item) => Number(item.quantity) < 2).length

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Package className="h-5 w-5" />
          Pantry Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 md:space-y-4">
          <div>
            <p className="text-xs md:text-sm text-muted-foreground">Total Items</p>
            <p className="text-xl md:text-2xl font-bold">{totalItems}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-muted-foreground">Total Quantity</p>
            <p className="text-xl md:text-2xl font-bold">{totalQuantity.toFixed(0)}</p>
          </div>
          {lowStockItems > 0 && (
            <div className="flex items-center gap-2 text-amber-600">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs md:text-sm">{lowStockItems} low stock items</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
