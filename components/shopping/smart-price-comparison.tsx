"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, TrendingDown, Store, Search, X, Package } from "lucide-react"
import { toast } from "react-toastify"

interface StorePrice {
  store_name: string
  store_chain: string
  address: string
  city: string
  price: number
  unit: string
  distance?: number
}

interface ProductComparison {
  product_name: string
  category: string
  prices: StorePrice[]
  cheapest_price: number
  most_expensive_price: number
  potential_savings: number
}

export function SmartPriceComparison() {
  const [comparisons, setComparisons] = useState<ProductComparison[]>([])
  const [loading, setLoading] = useState(true)
  const [drivingPreference, setDrivingPreference] = useState<"no_drive" | "flexible">("flexible")
  const [maxDistance, setMaxDistance] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [customSearch, setCustomSearch] = useState<string[]>([])
  const [userLat, setUserLat] = useState<number | null>(null)
  const [userLon, setUserLon] = useState<number | null>(null)
  const [locationSet, setLocationSet] = useState(false)
  const [hasReceipts, setHasReceipts] = useState(false)
  const [importing, setImporting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadUserPreferences()
    checkForPantryItems()
  }, [])

  useEffect(() => {
    if (locationSet) {
      loadPriceComparisons()
    }
  }, [locationSet, userLat, userLon])

  async function loadUserPreferences() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "driving_preference, max_driving_distance_miles, location_latitude, location_longitude, location_zip_code",
      )
      .eq("id", user.id)
      .single()

    if (profile) {
      setDrivingPreference(profile.driving_preference || "flexible")
      setMaxDistance(profile.max_driving_distance_miles || 10)
      setUserLat(profile.location_latitude)
      setUserLon(profile.location_longitude)
      setLocationSet(true)
    }
  }

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959 // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  async function loadPriceComparisons() {
    setLoading(true)
    try {
      console.log("[v0] Loading price comparisons...")

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        console.log("[v0] No user found")
        setLoading(false)
        return
      }

      const { data: prices, error } = await supabase
        .from("product_prices")
        .select(`
          product_name,
          category,
          price,
          unit,
          stores (
            name,
            chain,
            address,
            city,
            latitude,
            longitude
          )
        `)
        .eq("user_id", user.id)
        .order("product_name")

      console.log("[v0] Fetched prices:", prices?.length || 0)

      if (error) {
        console.error("[v0] Fetch error:", error)
        throw error
      }

      if (!prices || prices.length === 0) {
        console.log("[v0] No prices found in database")
        setComparisons([])
        setLoading(false)
        return
      }

      const productMap = new Map<string, ProductComparison>()

      prices?.forEach((item: any) => {
        if (!item.stores) {
          console.log("[v0] Skipping item without store:", item.product_name)
          return
        }

        const key = item.product_name
        if (!productMap.has(key)) {
          productMap.set(key, {
            product_name: item.product_name,
            category: item.category,
            prices: [],
            cheapest_price: Number.POSITIVE_INFINITY,
            most_expensive_price: 0,
            potential_savings: 0,
          })
        }

        const comparison = productMap.get(key)!

        let distance: number | undefined = undefined
        const hasValidStoreCoords =
          item.stores.latitude &&
          item.stores.longitude &&
          item.stores.latitude !== 40.7128 &&
          item.stores.longitude !== -74.006

        if (userLat && userLon && hasValidStoreCoords) {
          distance = calculateDistance(userLat, userLon, item.stores.latitude, item.stores.longitude)
          console.log(`[v0] Distance to ${item.stores.name}: ${distance.toFixed(2)} miles`)
        } else {
          console.log(`[v0] No valid coords for ${item.stores.name}, including without distance filter`)
        }

        const storePrice: StorePrice = {
          store_name: item.stores.name,
          store_chain: item.stores.chain,
          address: item.stores.address,
          city: item.stores.city,
          price: Number.parseFloat(item.price),
          unit: item.unit,
          distance,
        }

        comparison.prices.push(storePrice)
        comparison.cheapest_price = Math.min(comparison.cheapest_price, storePrice.price)
        comparison.most_expensive_price = Math.max(comparison.most_expensive_price, storePrice.price)
      })

      console.log("[v0] Processed products:", productMap.size)

      const comparisonsArray = Array.from(productMap.values()).map((comp) => {
        comp.potential_savings = comp.most_expensive_price - comp.cheapest_price
        comp.prices.sort((a, b) => a.price - b.price)
        return comp
      })

      const distanceLimit = drivingPreference === "no_drive" ? 2 : maxDistance
      const filtered = comparisonsArray.map((comp) => ({
        ...comp,
        // Keep stores without distance (no coords) or within distance limit
        prices: comp.prices.filter((p) => p.distance === undefined || p.distance <= distanceLimit),
      }))

      const finalComparisons = filtered.filter((c) => c.prices.length > 0)
      console.log("[v0] Final comparisons after distance filter:", finalComparisons.length)

      setComparisons(finalComparisons)
    } catch (error) {
      console.error("[v0] Load price comparisons error:", error)
    } finally {
      setLoading(false)
    }
  }

  function handleAddCustomSearch() {
    if (searchQuery.trim() && !customSearch.includes(searchQuery.trim())) {
      setCustomSearch([...customSearch, searchQuery.trim()])
      setSearchQuery("")
    }
  }

  function handleRemoveCustomSearch(item: string) {
    setCustomSearch(customSearch.filter((i) => i !== item))
  }

  async function checkForPantryItems() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: pantryItems } = await supabase.from("pantry_items").select("id").eq("user_id", user.id).limit(1)

    setHasReceipts((pantryItems?.length || 0) > 0)
  }

  async function importPricesFromPantry() {
    setImporting(true)
    try {
      console.log("[v0] Starting pantry/shopping list price import...")
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        console.log("[v0] No user found")
        return
      }

      let importedCount = 0

      // Import from pantry items
      const { data: pantryItems, error: pantryError } = await supabase
        .from("pantry_items")
        .select("name, category, price, unit, store, purchase_date")
        .eq("user_id", user.id)
        .not("price", "is", null)
        .not("store", "is", null)

      console.log("[v0] Found pantry items with prices:", pantryItems?.length || 0)

      if (pantryItems && pantryItems.length > 0) {
        for (const item of pantryItems) {
          // Find or create store
          const storeId = await findOrCreateStore(item.store, user.id)

          if (storeId) {
            const { data: existing } = await supabase
              .from("product_prices")
              .select("id")
              .eq("user_id", user.id)
              .eq("store_id", storeId)
              .eq("product_name", item.name)
              .single()

            if (existing) {
              console.log("[v0] Skipping duplicate:", item.name)
              continue
            }

            const { error: priceError } = await supabase.from("product_prices").insert({
              store_id: storeId,
              product_name: item.name,
              category: item.category || "Other",
              price: item.price,
              unit: item.unit || "each",
              user_id: user.id,
              last_updated: item.purchase_date || new Date().toISOString().split("T")[0],
            })

            if (!priceError) {
              importedCount++
              console.log("[v0] Imported price for:", item.name)
            } else {
              console.error("[v0] Error importing:", item.name, priceError)
            }
          }
        }
      }

      // Import from shopping list items with estimated prices
      const { data: shoppingItems, error: shoppingError } = await supabase
        .from("shopping_list_items")
        .select("name, category, estimated_price, unit")
        .eq("user_id", user.id)
        .not("estimated_price", "is", null)

      console.log("[v0] Found shopping list items with prices:", shoppingItems?.length || 0)

      console.log("[v0] Import complete. Total imported:", importedCount)

      if (importedCount > 0) {
        toast.success(`Imported ${importedCount} product prices!`)
        setTimeout(() => {
          loadPriceComparisons()
        }, 500)
      } else {
        toast.info("No new prices to import. Items may already be in the database.")
        loadPriceComparisons()
      }
    } catch (error) {
      console.error("[v0] Import prices error:", error)
      toast.error("Failed to import prices. Check console for details.")
    } finally {
      setImporting(false)
    }
  }

  async function findOrCreateStore(storeName: string, userId: string): Promise<string | null> {
    if (!storeName || storeName === "unknown") {
      storeName = "Local Store"
    }

    // Try to find existing store
    const { data: existingStore } = await supabase
      .from("stores")
      .select("id")
      .ilike("name", `%${storeName}%`)
      .limit(1)
      .single()

    if (existingStore) {
      return existingStore.id
    }

    // Create new store
    const { data: newStore, error } = await supabase
      .from("stores")
      .insert({
        name: storeName,
        chain: storeName,
        address: "Address not specified",
        city: "Unknown",
        state: "Unknown",
        zip_code: "00000",
        latitude: 40.7128,
        longitude: -74.006,
      })
      .select("id")
      .single()

    if (error) {
      console.error("[v0] Error creating store:", error)
      return null
    }

    return newStore?.id || null
  }

  const totalSavings = comparisons.reduce((sum, comp) => sum + comp.potential_savings, 0)

  const filteredComparisons = comparisons.filter((comp) => {
    if (customSearch.length === 0) return true
    return customSearch.some((search) => comp.product_name.toLowerCase().includes(search.toLowerCase()))
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading price comparisons...</p>
        </CardContent>
      </Card>
    )
  }

  if (!locationSet || (!userLat && !userLon)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            To see price comparisons at nearby stores, please set your location in Settings.
          </p>
          <Button onClick={() => (window.location.href = "/dashboard/settings")} className="w-full gap-2">
            <MapPin className="h-4 w-4" />
            Go to Settings
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Any Ingredient
          </CardTitle>
          <CardDescription>
            {comparisons.length === 0
              ? "No price data yet. Scan receipts to build your price database automatically!"
              : "Search from our database of common grocery items or add your own"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Try: Milk, Eggs, Bread, Bananas, Chicken, etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCustomSearch()}
              className="flex-1"
            />
            <Button onClick={handleAddCustomSearch} className="gap-2">
              <Search className="h-4 w-4" />
              Add
            </Button>
          </div>
          {customSearch.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customSearch.map((item) => (
                <Badge key={item} variant="secondary" className="gap-1 px-3 py-1">
                  {item}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveCustomSearch(item)} />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-emerald-600" />
            Potential Savings
          </CardTitle>
          <CardDescription>
            {drivingPreference === "no_drive"
              ? "Showing stores within 2 miles (walking/transit distance)"
              : `Showing stores within ${maxDistance} miles`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-600">${totalSavings.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground mt-1">by shopping at the cheapest stores for each item</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredComparisons.slice(0, 10).map((comparison) => (
          <Card key={comparison.product_name}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{comparison.product_name}</CardTitle>
                  <CardDescription>{comparison.category}</CardDescription>
                </div>
                {comparison.potential_savings > 0.5 && (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                  >
                    Save ${comparison.potential_savings.toFixed(2)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {comparison.prices.slice(0, 5).map((store, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      idx === 0
                        ? "bg-emerald-100 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700"
                        : "bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div
                          className={`font-medium ${idx === 0 ? "text-emerald-900 dark:text-emerald-100" : "text-foreground"}`}
                        >
                          {store.store_chain}
                        </div>
                        <div
                          className={`text-sm flex items-center gap-1 ${idx === 0 ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}`}
                        >
                          <MapPin className="h-3 w-3" />
                          {store.city}
                          {store.distance !== undefined ? ` • ${store.distance.toFixed(1)} mi` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div
                          className={`font-semibold ${idx === 0 ? "text-emerald-900 dark:text-emerald-100" : "text-foreground"}`}
                        >
                          ${store.price.toFixed(2)}
                        </div>
                        <div
                          className={`text-xs ${idx === 0 ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}`}
                        >
                          /{store.unit}
                        </div>
                      </div>
                      {idx === 0 && (
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white">
                          Best
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredComparisons.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
            {customSearch.length > 0 ? (
              <>
                <div>
                  <h3 className="font-semibold text-lg mb-2">No matches found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We couldn't find price data for "{customSearch.join(", ")}". Try searching for common items like
                    Milk, Eggs, Bread, or Chicken.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setCustomSearch([])} className="gap-2">
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {hasReceipts ? "Import Your Price Data" : "Build Your Price Database"}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {hasReceipts
                      ? "Import price data from your pantry items and shopping lists to start comparing prices across stores."
                      : "Add items to your pantry or shopping lists with store and price information to build your personalized price comparison database!"}
                  </p>
                </div>
                {hasReceipts ? (
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Button onClick={importPricesFromPantry} className="gap-2" disabled={importing}>
                      {importing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Package className="h-4 w-4" />
                          Import From Pantry
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => (window.location.href = "/dashboard/pantry")}
                      className="gap-2"
                    >
                      <Package className="h-4 w-4" />
                      Add Pantry Items
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => (window.location.href = "/dashboard/pantry")} className="gap-2">
                    <Package className="h-4 w-4" />
                    Add Items to Pantry
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
