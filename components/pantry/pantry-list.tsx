"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PantryItemCard } from "@/components/pantry/pantry-item-card"
import { Search } from "lucide-react"

interface PantryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  expiration_date: string | null
  price: number | null
  store: string | null
  location: string
  image_url: string | null
  is_favorite: boolean
}

interface PantryListProps {
  initialItems: PantryItem[]
}

/** Same fallback label the dashboard's category donut uses, so a blank/missing
 *  category reads consistently everywhere and never reaches Radix's Select
 *  (which throws on an empty-string item value). */
function normalizeCategory(category: string | null | undefined): string {
  return category?.trim() || "Uncategorized"
}

export function PantryList({ initialItems }: PantryListProps) {
  const searchParams = useSearchParams()
  const [items, setItems] = useState(initialItems)
  const [searchQuery, setSearchQuery] = useState("")
  // Pre-filtered when arriving from a link like /dashboard/pantry?category=Dairy
  // (the dashboard's category donut links here).
  const [categoryFilter, setCategoryFilter] = useState<string>(() => searchParams.get("category") || "all")
  const [sortBy, setSortBy] = useState<string>("recent")

  // The pantry page itself doesn't remount on a query-only navigation, so pick
  // up further changes to `?category=` (e.g. clicking a different slice while
  // already on this page) after the initial mount too.
  useEffect(() => {
    const category = searchParams.get("category")
    if (category) setCategoryFilter(category)
  }, [searchParams])

  const categories = ["all", ...Array.from(new Set(items.map((item) => normalizeCategory(item.category))))]

  const filteredItems = items
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || normalizeCategory(item.category) === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "expiration":
          if (!a.expiration_date) return 1
          if (!b.expiration_date) return -1
          return new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()
        case "quantity":
          return Number(a.quantity) - Number(b.quantity)
        default:
          return 0
      }
    })

  const handleDelete = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pantry items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 md:flex md:gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently Added</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="expiration">Expiration Date</SelectItem>
                  <SelectItem value="quantity">Quantity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-8 md:py-12 text-center">
            <p className="text-sm text-muted-foreground">No items found. Add your first item to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <PantryItemCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
