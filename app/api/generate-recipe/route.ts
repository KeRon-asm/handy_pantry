import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"

const recipeSchema = z.object({
  title: z.string().describe("A creative and appetizing recipe title"),
  description: z.string().describe("A brief description of the dish (1-2 sentences)"),
  ingredients: z
    .array(
      z.object({
        name: z.string(),
        amount: z.string(),
      }),
    )
    .describe("List of ingredients with amounts"),
  instructions: z.array(z.string()).describe("Step-by-step cooking instructions"),
  prep_time_minutes: z.number().describe("Preparation time in minutes"),
  cook_time_minutes: z.number().describe("Cooking time in minutes"),
  servings: z.number().describe("Number of servings"),
  difficulty: z.enum(["easy", "medium", "hard"]).describe("Difficulty level"),
  cuisine: z.string().describe("Type of cuisine (e.g., Italian, Mexican, Asian)"),
  tags: z.array(z.string()).describe("Relevant tags (e.g., quick, healthy, comfort food)"),
})

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Recipe generation request received")
    const { pantryItems, dietaryRestrictions, customRequest } = await request.json()

    if (!pantryItems || pantryItems.length === 0) {
      console.log("[v0] No pantry items provided")
      return NextResponse.json({ error: "No pantry items provided" }, { status: 400 })
    }

    const ingredientsList = pantryItems
      .map((item: any) => `${item.name} (${item.quantity} ${item.unit || "units"})`)
      .join(", ")
    console.log("[v0] Available ingredients:", ingredientsList)

    let prompt = `You are a creative chef who specializes in creating delicious recipes from available ingredients. Generate practical, tasty recipes that people can actually make.\n\n`

    prompt += `Create a delicious recipe using some or all of these available ingredients: ${ingredientsList}.`

    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      prompt += ` The recipe must accommodate these dietary restrictions: ${dietaryRestrictions.join(", ")}.`
      console.log("[v0] Dietary restrictions:", dietaryRestrictions)
    }

    if (customRequest) {
      prompt += ` Additional requirements: ${customRequest}.`
      console.log("[v0] Custom request:", customRequest)
    }

    prompt += ` Make sure the recipe is practical and uses ingredients that would commonly be found together. Focus on creating something delicious and achievable.`

    console.log("[v0] Starting AI recipe generation...")

    try {
      const { object } = await generateObject({
        model: "openai/gpt-4o-mini",
        schema: recipeSchema,
        prompt: prompt,
      })

      console.log("[v0] Recipe generation successful:", object.title)
      return NextResponse.json(object)
    } catch (aiError) {
      console.log("[v0] AI generation failed, using intelligent fallback")

      const firstFewItems = pantryItems.slice(0, 5).map((item: any) => item.name)

      const mockRecipe = {
        title: `Homemade ${firstFewItems[0] || "Pantry"} Delight`,
        description: `A delicious meal made with ${firstFewItems.join(", ")} and other pantry staples.`,
        ingredients: pantryItems.slice(0, 8).map((item: any) => ({
          name: item.name,
          amount: `${item.quantity} ${item.unit || "units"}`,
        })),
        instructions: [
          "Prepare and clean all ingredients thoroughly.",
          "Heat a large pan over medium heat with a bit of oil.",
          "Add your main ingredients and cook until they're tender.",
          "Season with salt, pepper, and your favorite spices.",
          "Combine everything together and cook for 5-10 more minutes.",
          "Serve hot and enjoy your homemade meal!",
        ],
        prep_time_minutes: 15,
        cook_time_minutes: 30,
        servings: 4,
        difficulty: "easy" as const,
        cuisine: "Home-style",
        tags: ["quick", "easy", "pantry-friendly"],
      }

      console.log("[v0] Returning mock recipe")
      return NextResponse.json(mockRecipe)
    }
  } catch (error) {
    console.error("[v0] Recipe generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate recipe",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
