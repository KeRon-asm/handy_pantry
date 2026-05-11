import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/get-user-profile"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ShoppingHeader } from "@/components/shopping/shopping-header"
import { ShoppingListManager } from "@/components/shopping/shopping-list-manager"
import { SmartRecommendations } from "@/components/shopping/smart-recommendations"
import { PantryIntelligence } from "@/components/shopping/pantry-intelligence"
import { CommunityPriceTracker } from "@/components/shopping/community-price-tracker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ShoppingPage() {
  const { user, displayName } = await getUserProfile()
  const supabase = await createClient()

  const [{ data: shoppingLists }, { data: shoppingListItems }, { data: pantryItems }] = await Promise.all([
    supabase.from("shopping_lists").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("shopping_list_items").select("*").eq("user_id", user.id),
    supabase.from("pantry_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ])

  return (
    <DashboardShell displayName={displayName}>
      <ShoppingHeader />
      <Tabs defaultValue="lists" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="lists">My Lists</TabsTrigger>
          <TabsTrigger value="smart">Smart Picks</TabsTrigger>
          <TabsTrigger value="pantry">Pantry AI</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        <TabsContent value="lists" className="space-y-6">
          <ShoppingListManager
            initialLists={shoppingLists || []}
            initialItems={shoppingListItems || []}
            userId={user.id}
          />
        </TabsContent>

        <TabsContent value="smart" className="space-y-6">
          <SmartRecommendations />
        </TabsContent>

        <TabsContent value="pantry" className="space-y-6">
          <PantryIntelligence initialPantryItems={pantryItems || []} userId={user.id} />
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <CommunityPriceTracker />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
