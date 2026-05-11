"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2, Eye, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Recipe {
  id: string
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
  is_favorite: boolean
}

interface RecipesListProps {
  initialRecipes: Recipe[]
}

export function RecipesList({ initialRecipes }: RecipesListProps) {
  const [recipes, setRecipes] = useState(initialRecipes)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return

    const supabase = createClient()
    const { error } = await supabase.from("recipes").delete().eq("id", id)

    if (error) {
      toast.error("Failed to delete recipe")
    } else {
      setRecipes(recipes.filter((r) => r.id !== id))
      toast.success("Recipe deleted")
      setSelectedRecipe(null)
    }
  }

  const handleToggleFavorite = async (id: string, currentValue: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from("recipes").update({ is_favorite: !currentValue }).eq("id", id)

    if (error) {
      toast.error("Failed to update favorite")
    } else {
      setRecipes(recipes.map((r) => (r.id === id ? { ...r, is_favorite: !currentValue } : r)))
      toast.success(currentValue ? "Removed from favorites" : "Added to favorites")
    }
  }

  if (recipes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No saved recipes yet. Generate your first recipe above!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold mb-4">Saved Recipes</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex-1">{recipe.title}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => handleToggleFavorite(recipe.id, recipe.is_favorite)}>
                    <Star
                      className={`h-4 w-4 ${recipe.is_favorite ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`}
                    />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">{recipe.difficulty}</Badge>
                  <Badge variant="outline">{recipe.cuisine}</Badge>
                  <Badge variant="outline">{recipe.prep_time_minutes + recipe.cook_time_minutes} min</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(recipe.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedRecipe.title}</DialogTitle>
                <p className="text-sm text-muted-foreground">{selectedRecipe.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge>{selectedRecipe.difficulty}</Badge>
                  <Badge variant="outline">{selectedRecipe.cuisine}</Badge>
                  <Badge variant="outline">{selectedRecipe.servings} servings</Badge>
                  <Badge variant="outline">Prep: {selectedRecipe.prep_time_minutes} min</Badge>
                  <Badge variant="outline">Cook: {selectedRecipe.cook_time_minutes} min</Badge>
                </div>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Ingredients</h3>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
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
                    {selectedRecipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white text-sm flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="flex-1">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {selectedRecipe.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
