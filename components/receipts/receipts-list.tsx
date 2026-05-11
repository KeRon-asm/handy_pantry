"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Eye, ShoppingCart } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Receipt {
  id: string
  store: string
  total_amount: number
  purchase_date: string
  created_at: string
  ocr_data?: {
    items: Array<{
      name: string
      price: number
      quantity?: number
      category?: string
      unit?: string
    }>
  }
}

interface ReceiptsListProps {
  initialReceipts: Receipt[]
}

export function ReceiptsList({ initialReceipts }: ReceiptsListProps) {
  const [receipts, setReceipts] = useState(initialReceipts)
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this receipt?")) return

    const supabase = createClient()
    const { error } = await supabase.from("receipts").delete().eq("id", id)

    if (error) {
      toast.error("Failed to delete receipt")
    } else {
      setReceipts(receipts.filter((r) => r.id !== id))
      toast.success("Receipt deleted")
    }
  }

  const handleView = (receipt: Receipt) => {
    setSelectedReceipt(receipt)
    setShowDetails(true)
  }

  if (receipts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No receipts yet. Scan your first receipt to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {receipts.map((receipt) => (
          <Card key={receipt.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{receipt.store}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold text-lg">${Number(receipt.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{format(new Date(receipt.purchase_date), "MMM dd, yyyy")}</span>
                </div>
                {receipt.ocr_data?.items && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items:</span>
                    <Badge variant="secondary">{receipt.ocr_data.items.length}</Badge>
                  </div>
                )}
                <div className="flex gap-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => handleView(receipt)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(receipt.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedReceipt?.store}</DialogTitle>
            <DialogDescription>
              {selectedReceipt && format(new Date(selectedReceipt.purchase_date), "MMMM dd, yyyy")}
            </DialogDescription>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="text-sm font-medium">Total Amount</span>
                <span className="text-2xl font-bold">${Number(selectedReceipt.total_amount).toFixed(2)}</span>
              </div>

              {selectedReceipt.ocr_data?.items && selectedReceipt.ocr_data.items.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Items ({selectedReceipt.ocr_data.items.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedReceipt.ocr_data.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          {item.category && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${item.price.toFixed(2)}</div>
                          {item.quantity && (
                            <div className="text-xs text-muted-foreground">
                              Qty: {item.quantity} {item.unit || ""}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
