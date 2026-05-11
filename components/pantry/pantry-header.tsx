"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export function PantryHeader() {
  return (
    <div className="flex items-center justify-between mb-4 md:mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Pantry</h1>
        <p className="text-sm text-muted-foreground hidden sm:block">Manage your food inventory</p>
      </div>
      <Button asChild size="sm" className="md:size-default">
        <Link href="/dashboard/pantry/add">
          <Plus className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Add Item</span>
        </Link>
      </Button>
    </div>
  )
}
