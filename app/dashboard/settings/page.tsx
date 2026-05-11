import { redirect } from 'next/navigation'
import { getUserProfile } from "@/lib/get-user-profile"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SettingsHeader } from "@/components/settings/settings-header"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { VoiceCommandsDemo } from "@/components/settings/voice-commands-demo"
import { LocationPreferences } from "@/components/settings/location-preferences"

export default async function SettingsPage() {
  const { user, profile, displayName } = await getUserProfile()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <DashboardShell displayName={displayName}>
      <SettingsHeader />
      <div className="space-y-6">
        <ProfileSettings profile={profile} userId={user.id} />
        <LocationPreferences />
        <VoiceCommandsDemo userId={user.id} />
      </div>
    </DashboardShell>
  )
}
