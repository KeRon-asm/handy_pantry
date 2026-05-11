"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { BarcodeScanner, type ProductData } from "./barcode-scanner"
import { Scan } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  location: z.string().min(1, "Location is required"),
  expiration_date: z.string().optional(),
  purchase_date: z.string().optional(),
  price: z.string().optional(),
  store: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface AddPantryItemFormProps {
  userId: string
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

const units = ["unit", "lb", "oz", "kg", "g", "L", "ml", "cup", "tbsp", "tsp"]
const locations = ["pantry", "refrigerator", "freezer", "cabinet"]

export function AddPantryItemForm({ userId }: AddPantryItemFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: "unit",
      location: "pantry",
      purchase_date: new Date().toISOString().split("T")[0],
    },
  })

  const handleScanSuccess = (productData: ProductData) => {
    console.log("[v0] Product scanned:", productData)
    console.log("[v0] Price from scan:", productData.price)
    
    setValue("name", productData.name)
    console.log("[v0] Set name:", productData.name)
    
    setValue("category", productData.category)
    console.log("[v0] Set category:", productData.category)
    
    if (productData.quantity) {
      setValue("quantity", productData.quantity)
      console.log("[v0] Set quantity:", productData.quantity)
    }
    if (productData.unit) {
      setValue("unit", productData.unit)
      console.log("[v0] Set unit:", productData.unit)
    }
    if (productData.price) {
      setValue("price", productData.price)
      console.log("[v0] Set price:", productData.price)
      // Force trigger validation to ensure field updates
      setValue("price", productData.price, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
    }
    if (productData.store) {
      setValue("store", productData.store)
      console.log("[v0] Set store:", productData.store)
    }
    if (productData.brand && !productData.store) {
      setValue("store", productData.brand)
      console.log("[v0] Set store from brand:", productData.brand)
    }
    
    // Add barcode and serving size to notes
    const notes = []
    notes.push(`Barcode: ${productData.barcode}`)
    if (productData.servingSize) {
      notes.push(`Serving Size: ${productData.servingSize}`)
    }
    if (notes.length > 0) {
      setValue("notes", notes.join("\n"))
    }
    
    setShowScanner(false)
    
    const imported = []
    if (productData.price) imported.push("price ($" + productData.price + ")")
    if (productData.store) imported.push("store")
    
    console.log("[v0] Final form values after scan:", {
      name: watch("name"),
      category: watch("category"),
      price: watch("price"),
      store: watch("store"),
      quantity: watch("quantity"),
      unit: watch("unit")
    })
    
    if (imported.length > 0) {
      toast.success(`Product loaded with ${imported.join(", ")}! Please verify and add expiration date.`)
    } else {
      toast.success("Product loaded! Please add price and expiration date.")
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    const supabase = createClient()

    const { error } = await supabase.from("pantry_items").insert({
      user_id: userId,
      name: data.name,
      category: data.category,
      quantity: Number.parseFloat(data.quantity),
      unit: data.unit,
      location: data.location,
      expiration_date: data.expiration_date || null,
      purchase_date: data.purchase_date || null,
      price: data.price ? Number.parseFloat(data.price) : null,
      store: data.store || null,
      notes: data.notes || null,
    })

    if (error) {
      toast.error("Failed to add item")
      console.error(error)
    } else {
      toast.success("Item added successfully!")
      router.push("/dashboard/pantry")
    }

    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {!showScanner && (
          <div className="mb-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowScanner(true)}
              className="gap-2"
            >
              <Scan className="h-4 w-4" />
              Scan Barcode
            </Button>
          </div>
        )}

        {showScanner && (
          <div className="mb-6">
            <BarcodeScanner
              onScanSuccess={handleScanSuccess}
              onClose={() => setShowScanner(false)}
              userId={userId}
            />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input id="name" {...register("name")} placeholder="e.g., Milk" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input id="quantity" type="number" step="0.01" {...register("quantity")} placeholder="1" />
              {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select defaultValue="unit" onValueChange={(value) => setValue("unit", value)}>
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

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select defaultValue="pantry" onValueChange={(value) => setValue("location", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc.charAt(0).toUpperCase() + loc.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration_date">Expiration Date</Label>
              <Input id="expiration_date" type="date" {...register("expiration_date")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input id="purchase_date" type="date" {...register("purchase_date")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" type="number" step="0.01" {...register("price")} placeholder="0.00" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store">Store</Label>
              <Input id="store" {...register("store")} placeholder="e.g., Walmart" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Additional notes..." rows={3} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Adding..." : "Add Item"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
