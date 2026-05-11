import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getUserProfile } from "@/lib/get-user-profile"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { PantryList } from "@/components/pantry/pantry-list"
import { PantryHeader } from "@/components/pantry/pantry-header"

export default async function PantryPage() {
  const { user, displayName } = await getUserProfile()
  const adminSupabase = createAdminClient()

  const { data: pantryItems } = await adminSupabase
    .from("pantry_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  console.log("[v0] Pantry items fetched:", pantryItems?.length || 0)

  return (
    <DashboardShell displayName={displayName}>
      <PantryHeader />
      <PantryList initialItems={pantryItems || []} />
    </DashboardShell>
  )
}
