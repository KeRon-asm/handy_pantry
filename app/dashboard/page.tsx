import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PantryOverview } from "@/components/dashboard/pantry-overview"
import { ExpirationAlerts } from "@/components/dashboard/expiration-alerts"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { PantryLifetimeStats } from "@/components/dashboard/pantry-lifetime-stats"
import { ShoppingFrequency } from "@/components/budget/shopping-frequency"
import { AnimatedGrid } from "@/components/dashboard/animated-grid"
import { CategoryDonut } from "@/components/dashboard/category-donut"
import { getCategoryBreakdown, getExpirationAlerts, getPantryStats } from "@/lib/pantry-stats"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const adminSupabase = createAdminClient()

  const [{ data: pantryItems }, { data: profile }, { data: expiringItems }, { data: receipts }] = await Promise.all([
    adminSupabase.from("pantry_items").select("*").eq("user_id", data.user.id).order("created_at", { ascending: false }),
    adminSupabase.from("profiles").select("*").eq("id", data.user.id).single(),
    adminSupabase
      .from("pantry_items")
      .select("*")
      .eq("user_id", data.user.id)
      .not("expiration_date", "is", null)
      .lte("expiration_date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
      .order("expiration_date", { ascending: true }),
    adminSupabase
      .from("receipts")
      .select("id, purchase_date, store")
      .eq("user_id", data.user.id)
      .order("purchase_date", { ascending: false }),
  ])

  const stats = getPantryStats(pantryItems || [], expiringItems || [])
  const categoryBreakdown = getCategoryBreakdown(pantryItems || [])
  const expirationAlerts = getExpirationAlerts(expiringItems || [])

  return (
    <DashboardShell displayName={profile?.display_name || "User"}>
      <DashboardHeader displayName={profile?.display_name || "User"} email={data.user.email || ""} stats={stats} />
      <PantryOverview stats={stats} />
      <AnimatedGrid className="mb-3 grid grid-cols-1 md:mb-6" delay={0.3}>
        <CategoryDonut breakdown={categoryBreakdown} />
      </AnimatedGrid>
      <AnimatedGrid className="grid gap-3 md:gap-6 sm:grid-cols-2" delay={0.42}>
        <PantryLifetimeStats items={pantryItems || []} />
        <ShoppingFrequency receipts={receipts || []} />
        <ExpirationAlerts items={expirationAlerts} />
        <QuickActions />
      </AnimatedGrid>
    </DashboardShell>
  )
}
