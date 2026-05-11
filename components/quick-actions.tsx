import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Receipt, ChefHat, ShoppingCart } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
            <Link href="/dashboard/pantry/add">
              <Plus className="h-5 w-5" />
              <span className="text-xs">Add Item</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
            <Link href="/dashboard/receipts/scan">
              <Receipt className="h-5 w-5" />
              <span className="text-xs">Scan Receipt</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
            <Link href="/dashboard/recipes">
              <ChefHat className="h-5 w-5" />
              <span className="text-xs">Get Recipe</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
            <Link href="/dashboard/shopping">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs">Shopping List</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
