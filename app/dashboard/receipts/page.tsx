import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getUserProfile } from "@/lib/get-user-profile"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ReceiptsHeader } from "@/components/receipts/receipts-header"
import { ReceiptsList } from "@/components/receipts/receipts-list"

export default async function ReceiptsPage() {
  const { user, displayName } = await getUserProfile()
  const adminSupabase = createAdminClient()

  const { data: receipts } = await adminSupabase
    .from("receipts")
    .select("*")
    .eq("user_id", user.id)
    .order("purchase_date", { ascending: false })

  return (
    <DashboardShell displayName={displayName}>
      <ReceiptsHeader />
      <ReceiptsList initialReceipts={receipts || []} />
    </DashboardShell>
  )
}
