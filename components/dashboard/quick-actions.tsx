import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Receipt, ChefHat, ShoppingCart } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <Button asChild variant="outline" className="h-24 md:h-20 flex flex-col gap-2 bg-transparent">
            <Link href="/dashboard/pantry/add">
              <Plus className="h-6 w-6 md:h-5 md:w-5" />
              <span className="text-xs md:text-sm">Add Item</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-24 md:h-20 flex flex-col gap-2 bg-transparent">
            <Link href="/dashboard/receipts/scan">
              <Receipt className="h-6 w-6 md:h-5 md:w-5" />
              <span className="text-xs md:text-sm">Scan Receipt</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-24 md:h-20 flex flex-col gap-2 bg-transparent">
            <Link href="/dashboard/recipes">
              <ChefHat className="h-6 w-6 md:h-5 md:w-5" />
              <span className="text-xs md:text-sm">Get Recipe</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-24 md:h-20 flex flex-col gap-2 bg-transparent">
            <Link href="/dashboard/shopping">
              <ShoppingCart className="h-6 w-6 md:h-5 md:w-5" />
              <span className="text-xs md:text-sm">Shopping List</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
