import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PersonalizationQuiz } from "@/components/onboarding/personalization-quiz"

export default async function OnboardingPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
      <PersonalizationQuiz userId={data.user.id} existingProfile={profile} />
    </div>
  )
}
