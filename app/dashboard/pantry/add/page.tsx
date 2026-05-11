import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AddPantryItemForm } from "@/components/pantry/add-pantry-item-form"

export default async function AddPantryItemPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <DashboardShell>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Add Pantry Item</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Add a new item to your pantry inventory</p>
        <AddPantryItemForm userId={data.user.id} />
      </div>
    </DashboardShell>
  )
}
