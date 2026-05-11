import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, recipe } = await request.json()

    console.log("[v0] Save recipe request for user:", userId)
    console.log("[v0] Recipe title:", recipe?.title)

    if (!userId || !recipe) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("recipes")
      .insert({
        user_id: userId,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prep_time_minutes: recipe.prep_time_minutes,
        cook_time_minutes: recipe.cook_time_minutes,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        cuisine: recipe.cuisine,
        tags: recipe.tags,
        source: "ai-generated",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Save recipe database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Recipe saved successfully:", data.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Save recipe error:", error)
    return NextResponse.json({ error: "Failed to save recipe" }, { status: 500 })
  }
}
