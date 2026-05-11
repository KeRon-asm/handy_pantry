"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, DollarSign } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ShoppingListItem {
  id: string
  shopping_list_id: string
  name: string
  quantity: number
  unit: string
  category: string | null
  estimated_price: number | null
  checked: boolean
  notes: string | null
}

interface ShoppingListProps {
  list: { id: string; name: string; status: string }
  items: ShoppingListItem[]
  userId: string
  onItemsChange: (items: ShoppingListItem[]) => void
}

const categories = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Meat",
  "Grains",
  "Canned Goods",
  "Snacks",
  "Beverages",
  "Condiments",
  "Frozen",
  "Other",
]
const units = ["unit", "lb", "oz", "kg", "g", "L", "ml"]

export function ShoppingList({ list, items, userId, onItemsChange }: ShoppingListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "1",
    unit: "unit",
    category: "Other",
    estimated_price: "",
  })
  const [isAdding, setIsAdding] = useState(false)

  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      toast.error("Please enter an item name")
      return
    }

    setIsAdding(true)
    const supabase = createClient()

    const { data: priceMatches } = await supabase
      .from("product_prices")
      .select("price")
      .ilike("product_name", `%${newItem.name}%`)
      .order("price", { ascending: true })
      .limit(1)

    const estimatedPrice =
      priceMatches && priceMatches.length > 0
        ? priceMatches[0].price
        : newItem.estimated_price
          ? Number.parseFloat(newItem.estimated_price)
          : null

    const { data, error } = await supabase
      .from("shopping_list_items")
      .insert({
        shopping_list_id: list.id,
        user_id: userId,
        name: newItem.name,
        quantity: Number.parseFloat(newItem.quantity),
        unit: newItem.unit,
        category: newItem.category,
        estimated_price: estimatedPrice,
        checked: false,
      })
      .select()
      .single()

    if (error) {
      toast.error("Failed to add item")
    } else {
      onItemsChange([...items, data])
      setNewItem({ name: "", quantity: "1", unit: "unit", category: "Other", estimated_price: "" })
      setIsAddDialogOpen(false)
      toast.success("Item added!")
    }

    setIsAdding(false)
  }

  const handleToggleCheck = async (itemId: string, currentValue: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from("shopping_list_items").update({ checked: !currentValue }).eq("id", itemId)

    if (!error) {
      onItemsChange(items.map((item) => (item.id === itemId ? { ...item, checked: !currentValue } : item)))
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("shopping_list_items").delete().eq("id", itemId)

    if (!error) {
      onItemsChange(items.filter((item) => item.id !== itemId))
      toast.success("Item removed")
    }
  }

  const totalEstimated = items.reduce((sum, item) => {
    return sum + (item.estimated_price ? Number(item.estimated_price) * item.quantity : 0)
  }, 0)

  const checkedCount = items.filter((item) => item.checked).length

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {checkedCount} of {items.length} items checked
          </p>
          {totalEstimated > 0 && (
            <p className="text-sm font-medium flex items-center gap-1 mt-1">
              <DollarSign className="h-4 w-4" />
              Estimated Total: ${totalEstimated.toFixed(2)}
            </p>
          )}
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Item to List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">Item Name *</Label>
                <Input
                  id="item-name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., Milk"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={newItem.unit} onValueChange={(value) => setNewItem({ ...newItem, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Estimated Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newItem.estimated_price}
                  onChange={(e) => setNewItem({ ...newItem, estimated_price: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <Button onClick={handleAddItem} disabled={isAdding} className="w-full">
                {isAdding ? "Adding..." : "Add Item"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          No items in this list. Add your first item to get started!
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 border rounded-lg ${
                item.checked ? "bg-muted" : "bg-card"
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <Checkbox checked={item.checked} onCheckedChange={() => handleToggleCheck(item.id, item.checked)} />
                <div className="flex-1">
                  <p className={`font-medium ${item.checked ? "line-through text-muted-foreground" : ""}`}>
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {item.quantity} {item.unit}
                    </span>
                    {item.category && (
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.estimated_price && (
                  <span className="font-medium">${(Number(item.estimated_price) * item.quantity).toFixed(2)}</span>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
