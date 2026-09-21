import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HoverIcon } from "@/components/ui/hover-icon"
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
          <Button asChild variant="outline" className="group h-24 md:h-20 flex flex-col gap-2 bg-transparent">
            <Link href="/dashboard/pantry/add">
              <HoverIcon><Plus className="h-6 w-6 md:h-5 md:w-5" /></HoverIcon>
              <span className="text-xs md:text-sm">Add Item</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="group h-24 md:h-20 flex flex-col gap-2 bg-transparent">
            <Link href="/dashboard/receipts/scan">
              <HoverIcon><Receipt className="h-6 w-6 md:h-5 md:w-5" /></HoverIcon>
              <span className="text-xs md:text-sm">Scan Receipt</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="group h-24 md:h-20 flex flex-col gap-2 bg-transparent">
            <Link href="/dashboard/recipes">
              <HoverIcon><ChefHat className="h-6 w-6 md:h-5 md:w-5" /></HoverIcon>
              <span className="text-xs md:text-sm">Get Recipe</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="group h-24 md:h-20 flex flex-col gap-2 bg-transparent">
            <Link href="/dashboard/shopping">
              <HoverIcon><ShoppingCart className="h-6 w-6 md:h-5 md:w-5" /></HoverIcon>
              <span className="text-xs md:text-sm">Shopping List</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
