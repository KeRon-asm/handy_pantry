import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getUserProfile } from "@/lib/get-user-profile"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { BudgetHeader } from "@/components/budget/budget-header"
import { BudgetOverview } from "@/components/budget/budget-overview"
import { SpendingChart } from "@/components/budget/spending-chart"
import { CategoryBreakdown } from "@/components/budget/category-breakdown"
import { SpendingTrends } from "@/components/budget/spending-trends"

export default async function BudgetPage() {
  const { user, profile, displayName } = await getUserProfile()
  const adminSupabase = createAdminClient()

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const [{ data: currentMonthSpending }, { data: historicalSpending }] = await Promise.all([
    adminSupabase
      .from("spending_analytics")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", currentMonth)
      .eq("year", currentYear),
    adminSupabase
      .from("spending_analytics")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split("T")[0])
      .order("date", { ascending: true }),
  ])

  const categoryTotals: Record<string, number> = {}
  currentMonthSpending?.forEach((item) => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + Number(item.amount)
  })

  const totalSpent = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0)

  return (
    <DashboardShell displayName={displayName}>
      <BudgetHeader />
      <div className="space-y-6">
        <BudgetOverview
          budgetLimit={profile?.budget_limit ? Number(profile.budget_limit) : null}
          totalSpent={totalSpent}
          userId={user.id}
        />
        <div className="grid gap-6 md:grid-cols-2">
          <SpendingChart data={historicalSpending || []} />
          <CategoryBreakdown categoryTotals={categoryTotals} />
        </div>
        <SpendingTrends data={historicalSpending || []} />
      </div>
    </DashboardShell>
  )
}
