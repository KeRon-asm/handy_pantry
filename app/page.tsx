import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom duration-700">
        <Card className="border-2 shadow-2xl bg-white dark:bg-zinc-950">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center animate-in zoom-in duration-500">
              <Leaf className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-black dark:text-white">Handy Pantry</CardTitle>
              <CardDescription className="text-base text-zinc-600 dark:text-zinc-400">
                Your smart kitchen companion
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-8 pb-8">
            <Button
              asChild
              size="lg"
              className="w-full text-lg h-14 bg-emerald-600 hover:bg-emerald-700 text-white animate-in fade-in slide-in-from-bottom duration-500 delay-200"
            >
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full text-lg h-14 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 animate-in fade-in slide-in-from-bottom duration-500 delay-300 bg-transparent"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
