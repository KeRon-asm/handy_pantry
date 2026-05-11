import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getUserProfile } from "@/lib/get-user-profile"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { RecipesHeader } from "@/components/recipes/recipes-header"
import { RecipesList } from "@/components/recipes/recipes-list"
import { RecipeGenerator } from "@/components/recipes/recipe-generator"

export default async function RecipesPage() {
  const { user, profile, displayName } = await getUserProfile()
  const adminSupabase = createAdminClient()

  const [{ data: recipes }, { data: pantryItems }] = await Promise.all([
    adminSupabase.from("recipes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    adminSupabase.from("pantry_items").select("name, category, quantity, unit").eq("user_id", user.id),
  ])

  return (
    <DashboardShell displayName={displayName}>
      <RecipesHeader />
      <RecipeGenerator
        pantryItems={pantryItems || []}
        dietaryRestrictions={profile?.dietary_restrictions || []}
        userId={user.id}
      />
      <RecipesList initialRecipes={recipes || []} />
    </DashboardShell>
  )
}
