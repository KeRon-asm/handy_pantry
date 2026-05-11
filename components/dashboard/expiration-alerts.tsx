import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface PantryItem {
  id: string
  name: string
  expiration_date: string | null
  quantity: number
}

interface ExpirationAlertsProps {
  items: PantryItem[]
}

export function ExpirationAlerts({ items }: ExpirationAlertsProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <AlertTriangle className="h-5 w-5" />
            Expiration Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs md:text-sm text-muted-foreground">No items expiring soon</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Expiration Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 md:space-y-3">
          {items.slice(0, 5).map((item) => {
            const expirationDate = new Date(item.expiration_date!)
            const isExpired = expirationDate < new Date()

            return (
              <div key={item.id} className="flex items-start gap-2 text-xs md:text-sm">
                <Calendar className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isExpired ? "text-red-500" : "text-amber-500"}`} />
                <div className="min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className={`text-xs ${isExpired ? "text-red-600" : "text-amber-600"}`}>
                    {isExpired ? "Expired" : "Expires"} {formatDistanceToNow(expirationDate, { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
