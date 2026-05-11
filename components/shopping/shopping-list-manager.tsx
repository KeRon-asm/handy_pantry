"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { ShoppingList } from "@/components/shopping/shopping-list"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ShoppingListType {
  id: string
  name: string
  status: string
  created_at: string
}

interface ShoppingListItem {
  id: string
  shopping_list_id: string
  name: string
  quantity: number
  unit: string
  category: string | null
  estimated_price: number | null
  checked: boolean
  notes: string | null
}

interface ShoppingListManagerProps {
  initialLists: ShoppingListType[]
  initialItems: ShoppingListItem[]
  userId: string
}

export function ShoppingListManager({ initialLists, initialItems, userId }: ShoppingListManagerProps) {
  const [lists, setLists] = useState(initialLists)
  const [items, setItems] = useState(initialItems)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [activeListId, setActiveListId] = useState(lists[0]?.id || "")

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error("Please enter a list name")
      return
    }

    setIsCreating(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("shopping_lists")
      .insert({
        user_id: userId,
        name: newListName,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      toast.error("Failed to create list")
    } else {
      setLists([data, ...lists])
      setActiveListId(data.id)
      setNewListName("")
      setIsCreateDialogOpen(false)
      toast.success("List created!")
    }

    setIsCreating(false)
  }

  const activeList = lists.find((list) => list.id === activeListId)
  const activeItems = items.filter((item) => item.shopping_list_id === activeListId)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Shopping Lists</CardTitle>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Shopping List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="list-name">List Name</Label>
                <Input
                  id="list-name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Weekly Groceries"
                />
              </div>
              <Button onClick={handleCreateList} disabled={isCreating} className="w-full">
                {isCreating ? "Creating..." : "Create List"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {lists.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No shopping lists yet. Create your first list to get started!
          </div>
        ) : (
          <Tabs value={activeListId} onValueChange={setActiveListId}>
            <TabsList className="w-full justify-start overflow-x-auto">
              {lists.map((list) => (
                <TabsTrigger key={list.id} value={list.id}>
                  {list.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {lists.map((list) => (
              <TabsContent key={list.id} value={list.id}>
                <ShoppingList list={list} items={activeItems} userId={userId} onItemsChange={setItems} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
