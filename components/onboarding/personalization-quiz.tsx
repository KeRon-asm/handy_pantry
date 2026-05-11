"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Leaf } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Profile {
  dietary_restrictions: string[]
  household_size: number
  budget_limit: number | null
}

interface PersonalizationQuizProps {
  userId: string
  existingProfile: Profile | null
}

const dietaryOptions = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut Allergy",
  "Kosher",
  "Halal",
  "Low-Carb",
  "Keto",
  "Paleo",
]

export function PersonalizationQuiz({ userId, existingProfile }: PersonalizationQuizProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState({
    householdSize: existingProfile?.household_size?.toString() || "1",
    dietaryRestrictions: existingProfile?.dietary_restrictions || [],
    budgetLimit: existingProfile?.budget_limit?.toString() || "",
    shoppingFrequency: "weekly",
  })
  const [isSaving, setIsSaving] = useState(false)

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleDietaryToggle = (option: string) => {
    if (answers.dietaryRestrictions.includes(option)) {
      setAnswers({
        ...answers,
        dietaryRestrictions: answers.dietaryRestrictions.filter((r) => r !== option),
      })
    } else {
      setAnswers({
        ...answers,
        dietaryRestrictions: [...answers.dietaryRestrictions, option],
      })
    }
  }

  const handleComplete = async () => {
    setIsSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("profiles")
      .update({
        household_size: Number.parseInt(answers.householdSize),
        dietary_restrictions: answers.dietaryRestrictions,
        budget_limit: answers.budgetLimit ? Number.parseFloat(answers.budgetLimit) : null,
      })
      .eq("id", userId)

    if (error) {
      toast.error("Failed to save preferences")
      setIsSaving(false)
    } else {
      toast.success("Preferences saved!")
      router.push("/dashboard")
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2">
          <Leaf className="h-8 w-8 text-emerald-600" />
          <span className="text-2xl font-bold text-emerald-900">Handy Pantry</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Let's Personalize Your Experience</CardTitle>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-muted-foreground mt-2">
            Step {step} of {totalSteps}
          </p>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">How many people are in your household?</h3>
                <div className="space-y-2">
                  <Label htmlFor="household-size">Household Size</Label>
                  <Input
                    id="household-size"
                    type="number"
                    min="1"
                    value={answers.householdSize}
                    onChange={(e) => setAnswers({ ...answers, householdSize: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    This helps us suggest appropriate portion sizes and quantities
                  </p>
                </div>
              </div>
              <Button onClick={() => setStep(2)} className="w-full">
                Next
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Any dietary restrictions or preferences?</h3>
                <div className="grid grid-cols-2 gap-4">
                  {dietaryOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={answers.dietaryRestrictions.includes(option)}
                        onCheckedChange={() => handleDietaryToggle(option)}
                      />
                      <Label htmlFor={option} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">We'll use this to filter recipes and suggestions</p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">What's your monthly grocery budget?</h3>
                <div className="space-y-2">
                  <Label htmlFor="budget">Monthly Budget (optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="budget"
                      type="number"
                      step="0.01"
                      value={answers.budgetLimit}
                      onChange={(e) => setAnswers({ ...answers, budgetLimit: e.target.value })}
                      className="pl-7"
                      placeholder="500.00"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">We'll help you track spending and stay within budget</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Review Your Preferences</h3>
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Household Size</p>
                    <p className="font-medium">
                      {answers.householdSize} {Number.parseInt(answers.householdSize) === 1 ? "person" : "people"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dietary Restrictions</p>
                    <p className="font-medium">
                      {answers.dietaryRestrictions.length > 0 ? answers.dietaryRestrictions.join(", ") : "None"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Budget</p>
                    <p className="font-medium">
                      {answers.budgetLimit ? `$${Number.parseFloat(answers.budgetLimit).toFixed(2)}` : "Not set"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleComplete} disabled={isSaving} className="flex-1">
                  {isSaving ? "Saving..." : "Complete Setup"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
