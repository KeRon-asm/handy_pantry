"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Trash2, Sparkles, Plus, Store } from "lucide-react"
import { toast } from "react-toastify"
import { QuickPriceUpdate } from "./quick-price-update"

interface ProductPrice {
  id: string
  product_name: string
  price: number
  unit: string
  store: {
    id: string
    name: string
    location: string
  }
}

export function SimplePriceLookup() {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<Record<string, ProductPrice[]>>({})
  const [stores, setStores] = useState<{ id: string; name: string; location: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddStore, setShowAddStore] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newStoreName, setNewStoreName] = useState("")
  const [newStoreLocation, setNewStoreLocation] = useState("")
  const [newProductName, setNewProductName] = useState("")
  const [newProductPrice, setNewProductPrice] = useState("")
  const [newProductUnit, setNewProductUnit] = useState("each")
  const [selectedStoreId, setSelectedStoreId] = useState("")
  const [estimating, setEstimating] = useState(false)
  const [priceEstimate, setPriceEstimate] = useState<{
    price: number
    unit: string
    confidence: string
    reasoning: string
  } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadStores()
  }, [])

  async function loadStores() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from("stores").select("id, name, city, state").order("name")

    if (data) {
      setStores(
        data.map((s) => ({
          id: s.id,
          name: s.name,
          location: `${s.city}, ${s.state}`,
        })),
      )
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: prices } = await supabase
        .from("product_prices")
        .select(
          `
          id,
          product_name,
          price,
          unit,
          stores (
            id,
            name,
            city,
            state
          )
        `,
        )
        .ilike("product_name", `%${searchQuery.trim()}%`)
        .order("price")

      if (prices) {
        const grouped: Record<string, ProductPrice[]> = {}
        prices.forEach((p: any) => {
          const key = p.product_name
          if (!grouped[key]) {
            grouped[key] = []
          }
          grouped[key].push({
            id: p.id,
            product_name: p.product_name,
            price: Number.parseFloat(p.price),
            unit: p.unit,
            store: {
              id: p.stores.id,
              name: p.stores.name,
              location: `${p.stores.city}, ${p.stores.state}`,
            },
          })
        })
        setResults(grouped)
      }
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Failed to search products")
    } finally {
      setLoading(false)
    }
  }

  async function handleAddStore() {
    if (!newStoreName.trim() || !newStoreLocation.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      const { data, error } = await supabase
        .from("stores")
        .insert({
          name: newStoreName.trim(),
          chain: newStoreName.trim(),
          address: "User specified",
          city: newStoreLocation.split(",")[0]?.trim() || "Unknown",
          state: newStoreLocation.split(",")[1]?.trim() || "Unknown",
          zip_code: "00000",
          latitude: 0,
          longitude: 0,
        })
        .select()
        .single()

      if (error) throw error

      toast.success("Store added successfully!")
      setNewStoreName("")
      setNewStoreLocation("")
      setShowAddStore(false)
      loadStores()
    } catch (error) {
      console.error("Add store error:", error)
      toast.error("Failed to add store")
    }
  }

  async function handleAddProduct() {
    if (!newProductName.trim() || !newProductPrice || !selectedStoreId) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("product_prices").insert({
        store_id: selectedStoreId,
        product_name: newProductName.trim(),
        category: "Other",
        price: Number.parseFloat(newProductPrice),
        unit: newProductUnit,
        user_id: user.id,
      })

      if (error) throw error

      toast.success("Product price added!")
      setNewProductName("")
      setNewProductPrice("")
      setNewProductUnit("each")
      setSelectedStoreId("")
      setShowAddProduct(false)
    } catch (error) {
      console.error("Add product error:", error)
      toast.error("Failed to add product price")
    }
  }

  async function handleDeletePrice(priceId: string) {
    try {
      const { error } = await supabase.from("product_prices").delete().eq("id", priceId)

      if (error) throw error

      toast.success("Price deleted")
      handleSearch()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete price")
    }
  }

  async function handleEstimatePrice() {
    if (!newProductName.trim() || !selectedStoreId) {
      toast.error("Please enter a product name and select a store first")
      return
    }

    const selectedStore = stores.find((s) => s.id === selectedStoreId)
    if (!selectedStore) return

    setEstimating(true)
    setPriceEstimate(null)

    try {
      const response = await fetch("/api/estimate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: newProductName.trim(),
          storeName: selectedStore.name,
        }),
      })

      if (!response.ok) throw new Error("Failed to estimate price")

      const estimate = await response.json()
      setPriceEstimate(estimate)
      setNewProductPrice(estimate.price.toString())
      setNewProductUnit(estimate.unit)

      toast.success(`AI estimated: $${estimate.price} per ${estimate.unit}`)
    } catch (error) {
      console.error("[v0] Estimation error:", error)
      toast.error("Failed to estimate price")
    } finally {
      setEstimating(false)
    }
  }

  async function handlePopulateCommonItems() {
    const selectedStore = stores.find((s) => s.id === selectedStoreId)
    if (!selectedStore) {
      toast.error("Please select a store first")
      return
    }

    const commonItems = [
      "Whole Milk",
      "Large Eggs",
      "White Bread",
      "Bananas",
      "Ground Beef",
      "Chicken Breast",
      "Cheddar Cheese",
      "Butter",
      "Orange Juice",
      "Apples",
    ]

    setEstimating(true)
    let successCount = 0

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      for (const item of commonItems) {
        try {
          // Get AI estimate
          const response = await fetch("/api/estimate-price", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productName: item,
              storeName: selectedStore.name,
            }),
          })

          if (!response.ok) continue

          const estimate = await response.json()

          // Add to database
          await supabase.from("product_prices").insert({
            store_id: selectedStoreId,
            product_name: item,
            category: "Produce",
            price: estimate.price,
            unit: estimate.unit,
            user_id: user.id,
          })

          successCount++
        } catch (error) {
          console.error(`[v0] Failed to add ${item}:`, error)
        }
      }

      toast.success(`Added ${successCount} common items to ${selectedStore.name}!`)
      setShowAddProduct(false)
    } catch (error) {
      console.error("[v0] Populate error:", error)
      toast.error("Failed to populate items")
    } finally {
      setEstimating(false)
    }
  }

  const totalResults = Object.keys(results).length

  return (
    <div className="space-y-6">
      <QuickPriceUpdate />

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Products
          </CardTitle>
          <CardDescription>Look up any ingredient to compare prices across your stores</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for products (e.g., Milk, Eggs, Bread...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading} className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Dialog open={showAddStore} onOpenChange={setShowAddStore}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Store className="h-4 w-4" />
                  Add Store
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a New Store</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Store Name</Label>
                    <Input
                      placeholder="Walmart, Target, Kroger..."
                      value={newStoreName}
                      onChange={(e) => setNewStoreName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      placeholder="City, State (e.g., Springfield, IL)"
                      value={newStoreLocation}
                      onChange={(e) => setNewStoreLocation(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddStore} className="w-full">
                    Add Store
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Add Product Price
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Add Product Price
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Product Name</Label>
                    <Input
                      placeholder="Milk, Eggs, Bread..."
                      value={newProductName}
                      onChange={(e) => {
                        setNewProductName(e.target.value)
                        setPriceEstimate(null)
                      }}
                    />
                  </div>
                  <div>
                    <Label>Store</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={selectedStoreId}
                      onChange={(e) => {
                        setSelectedStoreId(e.target.value)
                        setPriceEstimate(null)
                      }}
                    >
                      <option value="">Select a store</option>
                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name} - {store.location}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    variant="secondary"
                    onClick={handleEstimatePrice}
                    disabled={estimating || !newProductName || !selectedStoreId}
                    className="w-full gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {estimating ? "Estimating..." : "AI Estimate Price"}
                  </Button>

                  {priceEstimate && (
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="font-semibold">AI Estimate</span>
                          <Badge variant="secondary" className="ml-auto">
                            {priceEstimate.confidence} confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{priceEstimate.reasoning}</p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="3.99"
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={newProductUnit}
                        onChange={(e) => setNewProductUnit(e.target.value)}
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

                  <div className="flex gap-2">
                    <Button onClick={handleAddProduct} className="flex-1">
                      Add Price
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handlePopulateCommonItems}
                      disabled={estimating || !selectedStoreId}
                      className="gap-2 bg-transparent"
                    >
                      <Sparkles className="h-4 w-4" />
                      Quick Fill
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Quick Fill adds 10 common grocery items with AI-estimated prices
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {stores.length > 0 && (
            <div>
              <Label className="text-sm text-muted-foreground">Your Stores ({stores.length})</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {stores.map((store) => (
                  <Badge key={store.id} variant="secondary" className="gap-1">
                    <Store className="h-3 w-3" />
                    {store.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Searching...</p>
          </CardContent>
        </Card>
      ) : totalResults > 0 ? (
        <div className="space-y-4">
          {Object.entries(results).map(([productName, prices]) => {
            const cheapest = prices[0]
            const mostExpensive = prices[prices.length - 1]
            const savings = mostExpensive.price - cheapest.price

            return (
              <Card key={productName}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{productName}</CardTitle>
                      <CardDescription>
                        {prices.length} store{prices.length > 1 ? "s" : ""} found
                      </CardDescription>
                    </div>
                    {savings > 0.5 && (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                      >
                        <Search className="h-3 w-3 mr-1" />
                        Save ${savings.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {prices.map((price, idx) => (
                      <div
                        key={price.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          idx === 0
                            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800"
                            : "bg-card border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div
                              className={`font-medium ${idx === 0 ? "text-emerald-900 dark:text-emerald-100" : "text-foreground"}`}
                            >
                              {price.store.name}
                            </div>
                            <div
                              className={`text-sm flex items-center gap-1 ${idx === 0 ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}`}
                            >
                              <Search className="h-3 w-3" />
                              {price.store.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div
                              className={`font-semibold ${idx === 0 ? "text-emerald-900 dark:text-emerald-100" : "text-foreground"}`}
                            >
                              ${price.price.toFixed(2)}
                            </div>
                            <div
                              className={`text-xs ${idx === 0 ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}`}
                            >
                              /{price.unit}
                            </div>
                          </div>
                          {idx === 0 && <Badge className="bg-emerald-600 text-white">Best</Badge>}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePrice(price.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : searchQuery ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No results found for "{searchQuery}"</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              Try searching for something else, or add product prices using the button above.
            </p>
            <Button variant="outline" onClick={() => setShowAddProduct(true)}>
              Add Product Price
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
