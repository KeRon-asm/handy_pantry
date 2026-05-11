"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Link from "next/link"

interface Profile {
  id: string
  email: string
  display_name: string
  dietary_restrictions: string[]
  household_size: number
  budget_limit: number | null
}

interface ProfileSettingsProps {
  profile: Profile | null
  userId: string
}

export function ProfileSettings({ profile, userId }: ProfileSettingsProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [householdSize, setHouseholdSize] = useState(profile?.household_size?.toString() || "1")
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(profile?.dietary_restrictions || [])
  const [newRestriction, setNewRestriction] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleAddRestriction = () => {
    if (newRestriction.trim() && !dietaryRestrictions.includes(newRestriction.trim())) {
      setDietaryRestrictions([...dietaryRestrictions, newRestriction.trim()])
      setNewRestriction("")
    }
  }

  const handleRemoveRestriction = (restriction: string) => {
    setDietaryRestrictions(dietaryRestrictions.filter((r) => r !== restriction))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        household_size: Number.parseInt(householdSize),
        dietary_restrictions: dietaryRestrictions,
      })
      .eq("id", userId)

    if (error) {
      toast.error("Failed to update profile")
    } else {
      toast.success("Profile updated successfully!")
    }

    setIsSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={profile?.email || ""} disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="display-name">Display Name</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="household-size">Household Size</Label>
          <Input
            id="household-size"
            type="number"
            min="1"
            value={householdSize}
            onChange={(e) => setHouseholdSize(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Dietary Restrictions</Label>
          <div className="flex gap-2">
            <Input
              value={newRestriction}
              onChange={(e) => setNewRestriction(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddRestriction()}
              placeholder="Add restriction (e.g., Vegetarian, Gluten-Free)"
            />
            <Button type="button" onClick={handleAddRestriction}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {dietaryRestrictions.map((restriction) => (
              <Badge key={restriction} variant="secondary" className="gap-1">
                {restriction}
                <button onClick={() => handleRemoveRestriction(restriction)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button asChild variant="outline">
            <Link href="/onboarding">Take Personalization Quiz</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
