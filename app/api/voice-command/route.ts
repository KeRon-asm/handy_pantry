import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const commandSchema = z.object({
  action: z.enum(["add_item", "check_expiring", "add_to_shopping", "recipe_suggestion", "spending_summary", "unknown"]),
  itemName: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  category: z.string().optional(),
  response: z.string().describe("A friendly response message to the user"),
})

export async function POST(request: NextRequest) {
  try {
    const { command, userId } = await request.json()

    if (!command || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Use AI to interpret the voice command
    const { object } = await generateObject({
      model: "openai/gpt-4o-mini",
      schema: commandSchema,
      messages: [
        {
          role: "system",
          content:
            "You are a voice assistant for a pantry management app. Parse user voice commands and extract the action and relevant details. Provide a friendly confirmation message.",
        },
        {
          role: "user",
          content: command,
        },
      ],
    })

    const supabase = await createClient()

    // Execute the action
    switch (object.action) {
      case "add_item":
        if (object.itemName) {
          await supabase.from("pantry_items").insert({
            user_id: userId,
            name: object.itemName,
            quantity: object.quantity || 1,
            unit: object.unit || "unit",
            category: object.category || "Other",
          })
        }
        break

      case "add_to_shopping":
        if (object.itemName) {
          // Get or create active shopping list
          const { data: lists } = await supabase
            .from("shopping_lists")
            .select("id")
            .eq("user_id", userId)
            .eq("status", "active")
            .limit(1)

          let listId = lists?.[0]?.id

          if (!listId) {
            const { data: newList } = await supabase
              .from("shopping_lists")
              .insert({ user_id: userId, name: "Shopping List", status: "active" })
              .select("id")
              .single()
            listId = newList?.id
          }

          if (listId) {
            await supabase.from("shopping_list_items").insert({
              shopping_list_id: listId,
              user_id: userId,
              name: object.itemName,
              quantity: object.quantity || 1,
              unit: object.unit || "unit",
            })
          }
        }
        break

      case "check_expiring":
        const sevenDaysFromNow = new Date()
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

        const { data: expiringItems } = await supabase
          .from("pantry_items")
          .select("name")
          .eq("user_id", userId)
          .not("expiration_date", "is", null)
          .lte("expiration_date", sevenDaysFromNow.toISOString().split("T")[0])
          .limit(3)

        if (expiringItems && expiringItems.length > 0) {
          object.response = `You have ${expiringItems.length} items expiring soon: ${expiringItems.map((i) => i.name).join(", ")}`
        } else {
          object.response = "Great news! No items are expiring soon."
        }
        break

      case "spending_summary":
        const now = new Date()
        const currentMonth = now.getMonth() + 1
        const currentYear = now.getFullYear()

        const { data: spending } = await supabase
          .from("spending_analytics")
          .select("amount")
          .eq("user_id", userId)
          .eq("month", currentMonth)
          .eq("year", currentYear)

        const total = spending?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
        object.response = `You've spent $${total.toFixed(2)} this month.`
        break
    }

    return NextResponse.json({
      success: true,
      message: object.response,
      action: object.action,
    })
  } catch (error) {
    console.error("[v0] Voice command error:", error)
    return NextResponse.json({ success: false, message: "Failed to process command" }, { status: 500 })
  }
}
