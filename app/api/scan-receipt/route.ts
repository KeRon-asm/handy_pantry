import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const receiptSchema = z.object({
  store: z.string().describe("Store name"),
  total: z.number().describe("Total amount"),
  date: z.string().describe("Purchase date in YYYY-MM-DD format"),
  items: z.array(
    z.object({
      name: z.string().describe("Item name"),
      quantity: z.number().describe("Quantity purchased"),
      price: z.number().describe("Item price"),
      category: z.enum([
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
      ]).describe("Item category"),
    })
  ),
})

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Receipt scan request received")
    const { image } = await request.json()

    if (!image) {
      console.log("[v0] No image provided in request")
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] No authenticated user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Starting AI receipt extraction with vision model...")

    let receiptData: any

    try {
      const base64Data = image.split(',')[1] || image
      
      const result = await generateObject({
        model: "anthropic/claude-sonnet-4.5",
        schema: receiptSchema,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a receipt data extraction assistant for a pantry management app. Analyze this receipt image and extract:
- Store name
- Total amount
- Purchase date (in YYYY-MM-DD format, if not visible use today's date)
- All grocery items with their quantities, prices, and categories

Use these categories: Fruits, Vegetables, Dairy, Meat, Grains, Canned Goods, Snacks, Beverages, Condiments, Frozen, Other.
If quantity is not shown, use 1.`,
              },
              {
                type: "file",
                data: base64Data,
                mediaType: "image/jpeg",
                filename: "receipt.jpg",
              },
            ],
          },
        ],
      })

      receiptData = result.object
      console.log("[v0] Successfully extracted:", receiptData.items?.length || 0, "items from receipt")

      // Validate and fix date
      if (!receiptData.date || receiptData.date === "YYYY-MM-DD" || receiptData.date.includes("YYYY") || !/^\d{4}-\d{2}-\d{2}$/.test(receiptData.date)) {
        console.log("[v0] Invalid date format, using today's date")
        receiptData.date = new Date().toISOString().split("T")[0]
      }
    } catch (aiError) {
      console.error("[v0] AI extraction failed:", aiError)
      
      return NextResponse.json(
        {
          error: "AI receipt analysis failed",
          details: aiError instanceof Error ? aiError.message : "Could not analyze receipt image",
          suggestion: "Please try again with a clearer image"
        },
        { status: 500 }
      )
    }

    console.log("[v0] Inserting receipt into database...")
    
    try {
      const { data: receipt, error: receiptError } = await supabase
        .from("receipts")
        .insert({
          user_id: user.id,
          store: receiptData.store,
          total_amount: receiptData.total,
          purchase_date: receiptData.date,
          ocr_data: receiptData.items,
        })
        .select()
        .single()

      if (receiptError) {
        console.error("[v0] Receipt insert error:", receiptError)
        throw new Error(`Failed to save receipt: ${receiptError.message}`)
      }

      console.log("[v0] Receipt saved successfully, ID:", receipt.id)

      console.log("[v0] Adding items to pantry...")
      const pantryItems = receiptData.items.map((item: any) => ({
        user_id: user.id,
        name: item.name,
        quantity: item.quantity,
        unit: "unit",
        category: item.category,
        location: "Pantry",
        purchase_date: receiptData.date,
        price: item.price,
        store: receiptData.store,
      }))

      const { error: pantryError } = await supabase.from("pantry_items").insert(pantryItems)

      if (pantryError) {
        console.error("[v0] Pantry items insert error:", pantryError)
        throw new Error(`Failed to add items to pantry: ${pantryError.message}`)
      }

      console.log("[v0] Pantry items saved successfully")

      // Optional: Save receipt items details
      try {
        const receiptItems = receiptData.items.map((item: any) => ({
          receipt_id: receipt.id,
          user_id: user.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.price / item.quantity,
          total_price: item.price,
          category: item.category,
        }))

        await supabase.from("receipt_items").insert(receiptItems)
        console.log("[v0] Receipt items saved successfully")
      } catch (itemsErr) {
        console.error("[v0] Receipt items failed (continuing anyway):", itemsErr)
      }

      // Optional: Save analytics
      try {
        const analyticsData = receiptData.items.map((item: any) => {
          const date = new Date(receiptData.date)
          return {
            user_id: user.id,
            category: item.category,
            amount: item.price,
            date: receiptData.date,
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            store: receiptData.store,
          }
        })

        await supabase.from("spending_analytics").insert(analyticsData)
        console.log("[v0] Analytics saved successfully")
      } catch (analyticsErr) {
        console.error("[v0] Analytics failed (continuing anyway):", analyticsErr)
      }

      console.log("[v0] Receipt processing complete successfully")

      return NextResponse.json({
        ...receiptData,
        saved: true,
      })
    } catch (dbError) {
      console.error("[v0] Database error:", dbError)
      return NextResponse.json(
        {
          error: "Database error",
          details: dbError instanceof Error ? dbError.message : "Failed to save receipt data",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Receipt scanning error:", error)
    return NextResponse.json(
      {
        error: "Failed to process receipt",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
