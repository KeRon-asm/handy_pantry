import { NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { productName, storeName } = await req.json()

    console.log("[v0] Estimating price for:", { productName, storeName })

    // Use AI to estimate typical grocery prices
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a grocery price expert. Estimate a realistic current price for this product at this store.

Product: ${productName}
Store: ${storeName}

Provide ONLY a JSON response with this exact format (no markdown, no explanation):
{
  "price": 3.99,
  "unit": "each",
  "confidence": "high",
  "reasoning": "Brief explanation"
}

Use realistic 2024 prices. Common units: each, lb, oz, gallon, dozen, bag, box.
Confidence levels: high (common item), medium (less common), low (specialty item).`,
      maxTokens: 200,
    })

    console.log("[v0] AI response:", text)

    // Parse the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    const estimate = JSON.parse(jsonMatch[0])

    return NextResponse.json(estimate)
  } catch (error) {
    console.error("[v0] Price estimation error:", error)
    return NextResponse.json(
      { error: "Failed to estimate price", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
