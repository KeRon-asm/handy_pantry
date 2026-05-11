import { createClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'

export async function getUserProfile() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return {
    user: data.user,
    profile,
    displayName: profile?.display_name || data.user.email?.split("@")[0] || "User",
  }
}
