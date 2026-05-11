"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, X, Scan } from 'lucide-react'
import { toast } from "sonner"
import { BrowserMultiFormatReader } from "@zxing/library"
import { createClient } from "@/lib/supabase/client"

interface BarcodeScannerProps {
  onScanSuccess: (productData: ProductData) => void
  onClose: () => void
  userId: string
}

export interface ProductData {
  name: string
  category: string
  barcode: string
  quantity?: string
  unit?: string
  price?: string
  expirationDate?: string
  brand?: string
  servingSize?: string
  store?: string
}

export function BarcodeScanner({ onScanSuccess, onClose, userId }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (codeReaderRef.current) {
        codeReaderRef.current.reset()
      }
    }
  }, [])

  const startScanning = async () => {
    setIsScanning(true)
    setError(null)

    try {
      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader

      const videoInputDevices = await codeReader.listVideoInputDevices()
      
      if (videoInputDevices.length === 0) {
        setError("No camera found on this device")
        setIsScanning(false)
        return
      }

      // Use the back camera if available (for mobile)
      const selectedDevice = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back')
      ) || videoInputDevices[0]

      codeReader.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current!,
        async (result, error) => {
          if (result) {
            console.log("[v0] Barcode detected:", result.getText())
            const barcode = result.getText()
            
            // Stop scanning
            codeReader.reset()
            setIsScanning(false)

            // Look up product info
            await lookupProduct(barcode)
          }
          
          if (error && !(error instanceof Error && error.name === 'NotFoundException')) {
            console.error("[v0] Barcode scan error:", error)
          }
        }
      )
    } catch (err) {
      console.error("[v0] Camera error:", err)
      setError("Failed to access camera. Please check permissions.")
      setIsScanning(false)
    }
  }

  const lookupProduct = async (barcode: string) => {
    try {
      toast.loading("Looking up product information...")
      
      console.log("[v0] Fetching product data for barcode:", barcode)
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      const data = await response.json()

      let productData: ProductData

      if (data.status === 1 && data.product) {
        const product = data.product
        console.log("[v0] Product found in API:", product.product_name)
        
        productData = {
          name: product.product_name || product.generic_name || "Unknown Product",
          category: mapCategory(product.categories_tags?.[0]) || "Other",
          barcode: barcode,
          quantity: extractQuantity(product.quantity) || "1",
          unit: extractUnit(product.quantity) || "unit",
          brand: product.brands || undefined,
          servingSize: product.serving_size || undefined,
        }
      } else {
        // Product not found in Open Food Facts
        console.log("[v0] Product not found in API, using defaults")
        productData = {
          name: `Product ${barcode}`,
          category: "Other",
          barcode: barcode,
          quantity: "1",
          unit: "unit",
        }
      }

      console.log("[v0] Looking up price for:", productData.name)
      const priceData = await lookupPrice(productData.name, productData.category, userId)
      console.log("[v0] Price data returned:", priceData)
      
      if (priceData.price) {
        productData.price = priceData.price
        console.log("[v0] Price set to productData:", productData.price)
      } else {
        console.log("[v0] No price found")
      }
      if (priceData.store) {
        productData.store = priceData.store
        console.log("[v0] Store set to productData:", productData.store)
      }

      console.log("[v0] Final productData before callback:", productData)

      toast.dismiss()
      toast.success(`Product found: ${productData.name}${productData.price ? ` ($${productData.price})` : ''}`)
      onScanSuccess(productData)
      
    } catch (err) {
      console.error("[v0] Product lookup error:", err)
      toast.dismiss()
      toast.error("Failed to lookup product information")
      onScanSuccess({
        name: `Product ${barcode}`,
        category: "Other",
        barcode: barcode,
        quantity: "1",
        unit: "unit",
      })
    }
  }

  const lookupPrice = async (productName: string, category: string, userId: string): Promise<{ price?: string, store?: string }> => {
    const supabase = createClient()

    try {
      // Step 1: Check user's purchase history
      const { data: userPrices } = await supabase
        .from('product_prices')
        .select('price, store_id, stores(name)')
        .eq('user_id', userId)
        .ilike('product_name', `%${productName.split(' ')[0]}%`) // Match first word
        .order('last_updated', { ascending: false })
        .limit(1)

      if (userPrices && userPrices.length > 0) {
        console.log("[v0] Found price from user history:", userPrices[0].price)
        return {
          price: userPrices[0].price.toString(),
          store: userPrices[0].stores?.name
        }
      }

      // Step 2: Check community average prices
      const { data: communityPrices } = await supabase
        .from('product_prices')
        .select('price')
        .ilike('product_name', `%${productName.split(' ')[0]}%`)
        .order('last_updated', { ascending: false })
        .limit(10)

      if (communityPrices && communityPrices.length > 0) {
        const avgPrice = communityPrices.reduce((sum, item) => sum + Number(item.price), 0) / communityPrices.length
        console.log("[v0] Found community average price:", avgPrice.toFixed(2))
        return {
          price: avgPrice.toFixed(2)
        }
      }

      // Step 3: AI price estimation
      const estimatedPrice = await estimatePriceWithAI(productName, category)
      if (estimatedPrice) {
        console.log("[v0] AI estimated price:", estimatedPrice)
        return {
          price: estimatedPrice
        }
      }

    } catch (err) {
      console.error("[v0] Price lookup error:", err)
    }

    return {}
  }

  const estimatePriceWithAI = async (productName: string, category: string): Promise<string | undefined> => {
    try {
      const response = await fetch('/api/estimate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, category })
      })

      if (response.ok) {
        const data = await response.json()
        return data.estimatedPrice
      }
    } catch (err) {
      console.error("[v0] AI price estimation error:", err)
    }
    return undefined
  }

  const extractQuantity = (quantityString: string | undefined): string | undefined => {
    if (!quantityString) return undefined
    
    // Try to extract numeric value from strings like "500g", "1L", "12 oz"
    const match = quantityString.match(/(\d+\.?\d*)/)
    return match ? match[1] : undefined
  }

  const extractUnit = (quantityString: string | undefined): string | undefined => {
    if (!quantityString) return undefined
    
    const unitMap: Record<string, string> = {
      'g': 'g',
      'kg': 'kg',
      'l': 'L',
      'ml': 'ml',
      'oz': 'oz',
      'lb': 'lb',
      'gal': 'L',
      'pt': 'ml',
      'qt': 'L',
    }
    
    const lowerQuantity = quantityString.toLowerCase()
    for (const [key, value] of Object.entries(unitMap)) {
      if (lowerQuantity.includes(key)) {
        return value
      }
    }
    
    return undefined
  }

  const mapCategory = (tag: string | undefined): string => {
    if (!tag) return "Other"
    
    const categoryMap: Record<string, string> = {
      "dairy": "Dairy",
      "fruits": "Fruits",
      "vegetables": "Vegetables",
      "meat": "Meat",
      "beverages": "Beverages",
      "snacks": "Snacks",
      "grains": "Grains",
      "canned": "Canned Goods",
      "frozen": "Frozen",
      "condiments": "Condiments",
    }

    for (const [key, value] of Object.entries(categoryMap)) {
      if (tag.toLowerCase().includes(key)) {
        return value
      }
    }

    return "Other"
  }

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
    }
    setIsScanning(false)
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Scan Barcode
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {!isScanning && !error && (
            <div className="text-center py-8">
              <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Position the barcode within the camera view
              </p>
              <Button onClick={startScanning}>
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-emerald-500 w-64 h-32 rounded-lg" />
                </div>
              </div>
              <Button variant="outline" onClick={stopScanning} className="w-full">
                Stop Scanning
              </Button>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-sm text-red-500 mb-4">{error}</p>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
