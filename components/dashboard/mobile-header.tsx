"use client"

import { Button } from "@/components/ui/button"
import { Leaf, Menu, Settings } from 'lucide-react'
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import { TrendingUp, LogOut, User } from 'lucide-react'
import { useState } from "react"

interface MobileHeaderProps {
  displayName?: string
}

export function MobileHeader({ displayName }: MobileHeaderProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-40 bg-card border-b md:hidden pt-safe">
      <div className="flex items-center justify-between h-16 px-4">
        <Link href="/dashboard" className="flex items-center gap-2 active:scale-95 transition-transform">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">Handy Pantry</span>
        </Link>

        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 mt-8">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                  <User className="h-6 w-6 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground">View Profile</p>
                  </div>
                </div>

                <Link href="/dashboard/budget" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <TrendingUp className="h-5 w-5" />
                    Budget & Analytics
                  </Button>
                </Link>

                <Link href="/dashboard/settings" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <Settings className="h-5 w-5" />
                    Settings
                  </Button>
                </Link>

                <div className="border-t pt-4 mt-auto">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12 text-base text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
