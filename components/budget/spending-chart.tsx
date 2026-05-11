"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

interface SpendingData {
  date: string
  amount: number
  category: string
}

interface SpendingChartProps {
  data: SpendingData[]
}

export function SpendingChart({ data }: SpendingChartProps) {
  // Group by month and sum amounts
  const monthlyData: Record<string, number> = {}

  data.forEach((item) => {
    const monthKey = format(new Date(item.date), "MMM yyyy")
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(item.amount)
  })

  const chartData = Object.entries(monthlyData).map(([month, total]) => ({
    month,
    total: Number(total.toFixed(2)),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No spending data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Line type="monotone" dataKey="total" stroke="#059669" strokeWidth={2} dot={{ fill: "#059669" }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
