"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, Store, Package } from "lucide-react"
import { toast } from "react-toastify"

export function QuickPriceUpdate() {
  const [productName, setProductName] = useState("")
  const [storeName, setStoreName] = useState("")
  const [price, setPrice] = useState("")
  const [unit, setUnit] = useState("each")
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function handleQuickUpdate() {
    if (!productName.trim() || !storeName.trim() || !price) {
      toast.error("Please fill in all fields")
      return
    }

    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Find or create store
      let { data: store } = await supabase.from("stores").select("id").ilike("name", `%${storeName.trim()}%`).single()

      if (!store) {
        const { data: newStore } = await supabase
          .from("stores")
          .insert({
            name: storeName.trim(),
            chain: storeName.trim(),
            address: "User reported",
            city: "Unknown",
            state: "Unknown",
            zip_code: "00000",
            latitude: 0,
            longitude: 0,
          })
          .select("id")
          .single()

        store = newStore
      }

      if (!store) throw new Error("Failed to create store")

      // Add or update product price
      const { error } = await supabase.from("product_prices").upsert(
        {
          store_id: store.id,
          product_name: productName.trim(),
          category: "Other",
          price: Number.parseFloat(price),
          unit: unit,
          user_id: user.id,
          last_updated: new Date().toISOString(),
        },
        {
          onConflict: "store_id,product_name",
        },
      )

      if (error) throw error

      toast.success("Price updated! Thanks for contributing to community data!")
      setProductName("")
      setStoreName("")
      setPrice("")
      setUnit("each")
    } catch (error) {
      console.error("[v0] Quick update error:", error)
      toast.error("Failed to update price")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Quick Price Update
        </CardTitle>
        <CardDescription>
          See a price in-store? Add it here to help the community and improve your price tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Product Name
            </Label>
            <Input
              placeholder="e.g., Whole Milk, Bananas..."
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Store Name
            </Label>
            <Input
              placeholder="e.g., Walmart, Target..."
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Price
            </Label>
            <Input
              type="number"
              step="0.01"
              placeholder="3.99"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Unit</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="each">each</option>
              <option value="lb">lb</option>
              <option value="oz">oz</option>
              <option value="gallon">gallon</option>
              <option value="dozen">dozen</option>
              <option value="box">box</option>
              <option value="bag">bag</option>
            </select>
          </div>
        </div>

        <Button onClick={handleQuickUpdate} disabled={saving} className="w-full gap-2">
          <DollarSign className="h-4 w-4" />
          {saving ? "Saving..." : "Add Price"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Your price contributions are shared anonymously with the community to help everyone find better deals
        </p>
      </CardContent>
    </Card>
  )
}
