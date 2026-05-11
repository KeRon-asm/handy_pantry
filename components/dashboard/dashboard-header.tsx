interface DashboardHeaderProps {
  displayName: string
  email: string
}

export function DashboardHeader({ displayName, email }: DashboardHeaderProps) {
  return (
    <div className="mb-4 md:mb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Welcome back, {displayName}</h1>
      <p className="text-sm md:text-base text-muted-foreground">Here's what's happening in your pantry today</p>
    </div>
  )
}
