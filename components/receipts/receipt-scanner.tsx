"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, Camera, Loader2 } from 'lucide-react'
import { toast } from "sonner"
import Image from "next/image"

interface ReceiptScannerProps {
  userId: string
}

interface ExtractedItem {
  name: string
  quantity: number
  price: number
  category: string
}

interface OCRResult {
  store: string
  total: number
  date: string
  items: ExtractedItem[]
  saved?: boolean
  usingMockData?: boolean
}

export function ReceiptScanner({ userId }: ReceiptScannerProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<OCRResult | null>(null)
  const [processingStage, setProcessingStage] = useState<string>("Initializing...")

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setExtractedData(null)
      console.log("[v0] File selected:", file.name, file.size, "bytes")
    }
  }

  const handleScan = async () => {
    if (!selectedFile) {
      toast.error("Please select a receipt image first")
      return
    }

    setIsProcessing(true)
    setProcessingStage("Reading image file...")
    console.log("[v0] Starting receipt scan process...")

    try {
      const reader = new FileReader()
      reader.readAsDataURL(selectedFile)

      reader.onload = async () => {
        try {
          const base64Image = reader.result as string
          console.log("[v0] Image converted to base64, size:", base64Image.length, "chars")
          
          setProcessingStage("Analyzing receipt with AI...")
          console.log("[v0] Calling /api/scan-receipt...")

          const response = await fetch("/api/scan-receipt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64Image }),
          })

          console.log("[v0] API response status:", response.status)
          
          const data = await response.json()
          console.log("[v0] API response data:", data)

          if (!response.ok) {
            console.error("[v0] API error response:", data)
            throw new Error(data.details || data.error || "Failed to process receipt")
          }

          if (data.saved) {
            console.log("[v0] Receipt data successfully saved to database")
            setExtractedData(data)
            setIsProcessing(false)
            
            if (data.usingMockData) {
              toast.success("Receipt scanned with demo data and saved to pantry!")
            } else {
              toast.success(`Receipt scanned! ${data.items?.length || 0} items added to your pantry.`)
            }
          } else {
            console.warn("[v0] Receipt scanned but not saved:", data)
            setExtractedData(data)
            setIsProcessing(false)
            toast.warning("Receipt scanned but items were not saved. Please try again.")
          }
        } catch (fetchError) {
          console.error("[v0] Fetch error:", fetchError)
          setIsProcessing(false)
          toast.error(fetchError instanceof Error ? fetchError.message : "Failed to scan receipt")
        }
      }

      reader.onerror = () => {
        console.error("[v0] File reader error")
        setIsProcessing(false)
        toast.error("Failed to read image file. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Receipt scan error:", error)
      setIsProcessing(false)
      toast.error(error instanceof Error ? error.message : "Failed to scan receipt")
    }
  }

  const handleViewInPantry = () => {
    console.log("[v0] Navigating to pantry page...")
    toast.success("Items already saved! Redirecting to pantry...")
    router.push("/dashboard/pantry")
  }

  return (
    <div className="space-y-6">
      {isProcessing && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <Loader2 className="h-20 w-20 animate-spin text-primary" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-primary/40" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Scanning Receipt</h3>
                  <p className="text-sm text-muted-foreground">{processingStage}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Extracting items, prices, and categories...
                  </p>
                </div>
                <div className="w-full space-y-2">
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-pulse w-3/4" />
                  </div>
                  <p className="text-xs text-muted-foreground">This may take up to 30 seconds</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="receipt-upload">Upload Receipt Photo</Label>
              <div className="mt-2">
                <input
                  ref={fileInputRef}
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>

            {previewUrl && (
              <div className="relative w-full h-64 border rounded-lg overflow-hidden bg-muted">
                <Image src={previewUrl || "/placeholder.svg"} alt="Receipt preview" fill className="object-contain" />
              </div>
            )}

            {selectedFile && !extractedData && (
              <Button
                className="w-full h-14 text-base font-semibold"
                onClick={handleScan}
                disabled={isProcessing}
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5 mr-2" />
                    Scan Receipt with AI
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {extractedData && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Extracted Data</h3>
              {extractedData.saved && (
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">
                  ✓ Saved to Pantry
                </span>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Store:</span>
                <span className="font-medium">{extractedData.store}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{extractedData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold text-lg">${extractedData.total?.toFixed(2) || "0.00"}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Items ({extractedData.items?.length || 0})</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {extractedData.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-start text-sm p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.price?.toFixed(2) || "0.00"}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button className="flex-1" onClick={handleViewInPantry}>
                View in Pantry
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setExtractedData(null)
                  setSelectedFile(null)
                  setPreviewUrl(null)
                }}
              >
                Scan Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
