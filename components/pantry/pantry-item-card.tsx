"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import Link from "next/link"

interface PantryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  expiration_date: string | null
  price: number | null
  store: string | null
  location: string
  image_url: string | null
  is_favorite: boolean
}

interface PantryItemCardProps {
  item: PantryItem
  onDelete: (id: string) => void
}

export function PantryItemCard({ item, onDelete }: PantryItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return

    setIsDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from("pantry_items").delete().eq("id", item.id)

    if (!error) {
      onDelete(item.id)
    }
    setIsDeleting(false)
  }

  const getExpirationStatus = () => {
    if (!item.expiration_date) return null

    const expirationDate = new Date(item.expiration_date)
    const today = new Date()
    const diffDays = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { label: "Expired", variant: "destructive" as const }
    } else if (diffDays <= 3) {
      return { label: "Expires soon", variant: "destructive" as const }
    } else if (diffDays <= 7) {
      return { label: "Expires this week", variant: "secondary" as const }
    }
    return null
  }

  const expirationStatus = getExpirationStatus()

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow active:scale-[0.98]">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start justify-between mb-2 md:mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base md:text-lg mb-1 truncate">{item.name}</h3>
            <Badge variant="outline" className="text-xs">
              {item.category}
            </Badge>
          </div>
          {item.is_favorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0 ml-2" />}
        </div>

        <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Quantity:</span>
            <span className="font-medium text-foreground">
              {item.quantity} {item.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Location:</span>
            <span className="font-medium text-foreground capitalize">{item.location}</span>
          </div>
          {item.expiration_date && (
            <div className="flex justify-between">
              <span>Expires:</span>
              <span className="font-medium text-foreground">
                {formatDistanceToNow(new Date(item.expiration_date), { addSuffix: true })}
              </span>
            </div>
          )}
          {item.price && (
            <div className="flex justify-between">
              <span>Price:</span>
              <span className="font-medium text-foreground">${Number(item.price).toFixed(2)}</span>
            </div>
          )}
        </div>

        {expirationStatus && (
          <Badge variant={expirationStatus.variant} className="mt-2 md:mt-3 w-full justify-center text-xs">
            {expirationStatus.label}
          </Badge>
        )}
      </CardContent>

      <CardFooter className="p-3 md:p-4 pt-0 gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1 h-9 md:h-8 bg-transparent">
          <Link href={`/dashboard/pantry/edit/${item.id}`}>
            <Edit className="h-4 w-4 md:mr-1" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9 md:h-8 bg-transparent"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 md:mr-1" />
          <span className="hidden sm:inline">{isDeleting ? "Deleting..." : "Delete"}</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
