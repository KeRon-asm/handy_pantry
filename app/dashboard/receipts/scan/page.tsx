import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ReceiptScanner } from "@/components/receipts/receipt-scanner"

export default async function ScanReceiptPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Scan Receipt</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Upload a receipt photo and let AI extract the items</p>
        <ReceiptScanner userId={data.user.id} />
      </div>
    </DashboardShell>
  )
}
