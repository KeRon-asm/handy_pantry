"use client"

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"

/**
 * Very subtle, emerald-tinted blobs that drift as the dashboard scrolls.
 * Meant to be felt more than seen — this sits behind data-dense cards, so it
 * stays at low opacity and never moves fast enough to distract from reading
 * numbers. Rendered once in DashboardShell, so it's consistent across every
 * authenticated route (pantry, shopping, receipts, budget, settings).
 *
 * All hooks run unconditionally on every render (including when reduced
 * motion is preferred) so the number of hooks never changes between renders
 * — only whether their output is applied to the `style` prop changes. That
 * avoids a Rules-of-Hooks violation from `useReducedMotion()` flipping from
 * `null` (before mount) to a boolean shortly after.
 */
export function DashboardBackground() {
  const shouldReduceMotion = useReducedMotion()
  const { scrollY } = useScroll()

  const y1 = useTransform(scrollY, [0, 2400], [0, -180])
  const y2 = useTransform(scrollY, [0, 2400], [0, 220])
  const y3 = useTransform(scrollY, [0, 2400], [0, -120])
  const rotate = useTransform(scrollY, [0, 2400], [0, 18])

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <motion.div
        style={shouldReduceMotion ? undefined : { y: y1 }}
        className="absolute -top-48 -left-40 h-[30rem] w-[30rem] rounded-full bg-primary/[0.06] blur-3xl"
      />
      <motion.div
        style={shouldReduceMotion ? undefined : { y: y2, rotate }}
        className="absolute top-[40%] -right-44 h-[26rem] w-[26rem] rounded-full bg-primary/[0.05] blur-3xl"
      />
      <motion.div
        style={shouldReduceMotion ? undefined : { y: y3 }}
        className="absolute -bottom-40 left-[22%] h-[22rem] w-[22rem] rounded-full bg-accent/[0.08] blur-3xl"
      />
    </div>
  )
}
