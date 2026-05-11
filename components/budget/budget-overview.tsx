"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { DollarSign, TrendingUp, TrendingDown, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface BudgetOverviewProps {
  budgetLimit: number | null
  totalSpent: number
  userId: string
}

export function BudgetOverview({ budgetLimit, totalSpent, userId }: BudgetOverviewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newBudget, setNewBudget] = useState(budgetLimit?.toString() || "")
  const [isSaving, setIsSaving] = useState(false)

  const budgetPercentage = budgetLimit ? (totalSpent / budgetLimit) * 100 : 0
  const remaining = budgetLimit ? budgetLimit - totalSpent : null

  const handleSaveBudget = async () => {
    setIsSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("profiles")
      .update({ budget_limit: Number.parseFloat(newBudget) })
      .eq("id", userId)

    if (error) {
      toast.error("Failed to update budget")
    } else {
      toast.success("Budget updated successfully!")
      setIsDialogOpen(false)
      window.location.reload()
    }

    setIsSaving(false)
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Monthly Budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget Amount ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="500.00"
                  />
                </div>
                <Button onClick={handleSaveBudget} disabled={isSaving} className="w-full">
                  {isSaving ? "Saving..." : "Save Budget"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{budgetLimit ? `$${budgetLimit.toFixed(2)}` : "Not Set"}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {budgetLimit ? "per month" : "Click settings to set a budget"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">this month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          {remaining !== null &&
            (remaining >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            ))}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${remaining !== null && remaining < 0 ? "text-red-600" : ""}`}>
            {remaining !== null ? `$${Math.abs(remaining).toFixed(2)}` : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {remaining !== null && remaining < 0 ? "over budget" : "left to spend"}
          </p>
        </CardContent>
      </Card>

      {budgetLimit && (
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Budget Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={Math.min(budgetPercentage, 100)} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>{budgetPercentage.toFixed(1)}% used</span>
              <span>
                ${totalSpent.toFixed(2)} / ${budgetLimit.toFixed(2)}
              </span>
            </div>
            {budgetPercentage >= 90 && budgetPercentage < 100 && (
              <p className="text-sm text-amber-600 mt-2">Warning: You're approaching your budget limit</p>
            )}
            {budgetPercentage >= 100 && (
              <p className="text-sm text-red-600 mt-2">Alert: You've exceeded your budget!</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
