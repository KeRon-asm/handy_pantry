"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ChefHat, Loader2, Sparkles } from 'lucide-react'
import { toast } from "sonner"

interface PantryItem {
  name: string
  category: string
  quantity: number
  unit: string
}

interface RecipeGeneratorProps {
  pantryItems: PantryItem[]
  dietaryRestrictions: string[]
  userId: string
}

interface GeneratedRecipe {
  title: string
  description: string
  ingredients: { name: string; amount: string }[]
  instructions: string[]
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  difficulty: string
  cuisine: string
  tags: string[]
}

export function RecipeGenerator({ pantryItems, dietaryRestrictions, userId }: RecipeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null)
  const [customRequest, setCustomRequest] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleGenerate = async () => {
    if (pantryItems.length === 0) {
      toast.error("Add items to your pantry first!")
      return
    }

    setIsGenerating(true)
    setGeneratedRecipe(null)
    console.log("[v0] Starting recipe generation...")
    console.log("[v0] Pantry items:", pantryItems.length)
    console.log("[v0] Dietary restrictions:", dietaryRestrictions)

    try {
      const response = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pantryItems,
          dietaryRestrictions,
          customRequest,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("[v0] API error:", data)
        throw new Error(data.details || data.error || "Failed to generate recipe")
      }

      console.log("[v0] Recipe generation successful:", data.title)
      setGeneratedRecipe(data)
      toast.success("Recipe generated!")
    } catch (error) {
      console.error("[v0] Recipe generation error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate recipe. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedRecipe) return

    setIsSaving(true)
    console.log("[v0] Saving recipe:", generatedRecipe.title)

    try {
      const response = await fetch("/api/save-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          recipe: generatedRecipe,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("[v0] Save recipe failed:", data)
        throw new Error(data.error || "Failed to save recipe")
      }

      console.log("[v0] Recipe saved successfully:", data)
      toast.success("Recipe saved to your collection!")
      setGeneratedRecipe(null)
      setCustomRequest("")
    } catch (error) {
      console.error("[v0] Recipe save error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save recipe")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Generate Recipe with AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Available Ingredients ({pantryItems.length})</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {pantryItems.slice(0, 10).map((item, index) => (
                <Badge key={index} variant="secondary">
                  {item.name}
                </Badge>
              ))}
              {pantryItems.length > 10 && <Badge variant="outline">+{pantryItems.length - 10} more</Badge>}
            </div>
          </div>

          {dietaryRestrictions.length > 0 && (
            <div>
              <Label>Dietary Restrictions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {dietaryRestrictions.map((restriction, index) => (
                  <Badge key={index} variant="outline">
                    {restriction}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="custom-request">Special Requests (Optional)</Label>
            <Textarea
              id="custom-request"
              placeholder="e.g., I want something spicy, quick to make, Italian cuisine..."
              value={customRequest}
              onChange={(e) => setCustomRequest(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          <Button className="w-full" onClick={handleGenerate} disabled={isGenerating || pantryItems.length === 0}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Recipe...
              </>
            ) : (
              <>
                <ChefHat className="h-4 w-4 mr-2" />
                Generate Recipe
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedRecipe && (
        <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{generatedRecipe.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">{generatedRecipe.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge>{generatedRecipe.difficulty}</Badge>
              <Badge variant="outline">{generatedRecipe.cuisine}</Badge>
              <Badge variant="outline">{generatedRecipe.servings} servings</Badge>
              <Badge variant="outline">
                {generatedRecipe.prep_time_minutes + generatedRecipe.cook_time_minutes} min total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Ingredients</h3>
              <ul className="space-y-2">
                {generatedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>
                      {ingredient.amount} {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Instructions</h3>
              <ol className="space-y-3">
                {generatedRecipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="flex-1">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {generatedRecipe.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {generatedRecipe.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Recipe"}
              </Button>
              <Button variant="outline" onClick={() => setGeneratedRecipe(null)}>
                Discard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
