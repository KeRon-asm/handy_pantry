import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertTriangle,
  ArrowRight,
  ChefHat,
  Leaf,
  PiggyBank,
  Receipt,
  ShoppingCart,
  Sparkles,
} from "lucide-react"
import { LandingBackground } from "@/components/marketing/landing-background"

const FEATURES = [
  {
    icon: Sparkles,
    title: "Track Your Pantry",
    description: "Log what's in your kitchen by category, quantity, and location, so you always know what you have.",
  },
  {
    icon: AlertTriangle,
    title: "Expiration Alerts",
    description: "Color-coded warnings for anything expiring soon, with one tap to mark it used or plan a recipe around it.",
  },
  {
    icon: ChefHat,
    title: "AI Recipe Ideas",
    description: "Generate recipes from what's already in your pantry, so nothing goes to waste before it expires.",
  },
  {
    icon: Receipt,
    title: "Receipt Scanning",
    description: "Snap a photo of a grocery receipt and let it read the items, prices, and store straight into your pantry.",
  },
  {
    icon: PiggyBank,
    title: "Budget Insights",
    description: "See spending by category and how often you shop, so grocery budgeting stops being a guessing game.",
  },
  {
    icon: ShoppingCart,
    title: "Smart Shopping Lists",
    description: "Get suggestions based on what's running low, and check items off as you go.",
  },
]

const STEPS = [
  {
    number: "1",
    title: "Add what you buy",
    description: "Type it in, scan a barcode, or snap a receipt — whatever's fastest.",
  },
  {
    number: "2",
    title: "Get nudged before it expires",
    description: "Handy Pantry watches expiration dates so you don't have to.",
  },
  {
    number: "3",
    title: "Waste less, spend less",
    description: "Use ingredients before they turn, and see exactly where your grocery budget goes.",
  },
]

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <LandingBackground />

      <div className="relative z-10">
        {/* Nav */}
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-black dark:text-white">Handy Pantry</span>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </header>

        {/* Hero */}
        <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-20 pt-8 text-center md:pb-28 md:pt-16">
          <div className="animate-in zoom-in mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20 duration-500">
            <Leaf className="h-10 w-10 text-white" />
          </div>
          <h1 className="animate-in fade-in slide-in-from-bottom text-4xl font-bold tracking-tight text-black duration-700 md:text-6xl dark:text-white">
            Your smart kitchen companion
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom mt-5 max-w-xl text-balance text-lg text-zinc-600 delay-150 duration-700 md:text-xl dark:text-zinc-400">
            Track your pantry, catch food before it expires, and turn what you already own into your next meal.
          </p>
          <div className="animate-in fade-in slide-in-from-bottom mt-8 flex w-full max-w-sm flex-col gap-3 delay-300 duration-700 sm:flex-row">
            <Button asChild size="lg" className="h-14 flex-1 bg-emerald-600 text-lg text-white hover:bg-emerald-700">
              <Link href="/auth/sign-up">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 flex-1 border-2 border-emerald-600 bg-transparent text-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <h2 className="text-3xl font-bold text-black md:text-4xl dark:text-white">Everything your kitchen needs</h2>
            <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
              One app to track what you have, plan what to cook, and keep an eye on what it's costing you.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="border-2 bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80">
                  <CardHeader>
                    <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                      <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <h2 className="text-3xl font-bold text-black md:text-4xl dark:text-white">How it works</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">{step.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-3xl px-4 pb-24 pt-8 text-center md:pb-32">
          <Card className="border-2 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-zinc-950/80">
            <CardContent className="flex flex-col items-center gap-5 py-12">
              <h2 className="text-2xl font-bold text-black md:text-3xl dark:text-white">Ready to stop wasting food?</h2>
              <p className="max-w-md text-zinc-600 dark:text-zinc-400">
                It takes less than a minute to add your first pantry item.
              </p>
              <Button asChild size="lg" className="h-14 w-full max-w-xs bg-emerald-600 text-lg text-white hover:bg-emerald-700">
                <Link href="/auth/sign-up">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <footer className="mt-16 text-sm text-zinc-500 dark:text-zinc-500">
            <p>Handy Pantry — built to keep your kitchen organized.</p>
          </footer>
        </section>
      </div>
    </div>
  )
}
