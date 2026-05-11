"use client"

import { Button } from "@/components/ui/button"
import { Receipt } from "lucide-react"
import Link from "next/link"

export function ReceiptsHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Receipts</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your grocery purchases</p>
      </div>
      <Button asChild>
        <Link href="/dashboard/receipts/scan">
          <Receipt className="h-4 w-4 mr-2" />
          Scan Receipt
        </Link>
      </Button>
    </div>
  )
}
