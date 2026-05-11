import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { MobileHeader } from "@/components/dashboard/mobile-header"

interface DashboardShellProps {
  children: React.ReactNode
  displayName?: string
}

export function DashboardShell({ children, displayName = "User" }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileHeader displayName={displayName} />
        <main className="flex-1 bg-background pb-24 md:pb-0">
          <div className="container mx-auto p-3 md:p-6 lg:p-8 max-w-7xl">{children}</div>
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
