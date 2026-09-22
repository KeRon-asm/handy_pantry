"use client"

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"

/**
 * Bold "aurora" of blurred emerald blobs behind the landing page — each one
 * drifts a different distance and rotates as the whole page scrolls, so the
 * background visibly reshapes itself between the hero and the footer. Two
 * blobs also get a slow, independent breathing pulse so the page still feels
 * alive before the visitor scrolls at all.
 *
 * Deliberately louder than DashboardBackground (higher opacity, bigger
 * blobs, more movement) — this is the marketing page, not a data screen.
 *
 * Hooks run unconditionally every render (see DashboardBackground for why);
 * only the `style`/`animate` props are conditioned on reduced-motion.
 */
export function LandingBackground() {
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -280])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 340])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y4 = useTransform(scrollYProgress, [0, 1], [0, 260])
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 45])
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -35])
  const scale3 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.18, 1])

  const idlePulse = shouldReduceMotion
    ? undefined
    : { scale: [1, 1.08, 1], transition: { duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" as const } }

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-white dark:bg-black" aria-hidden="true">
      <motion.div
        animate={idlePulse}
        style={shouldReduceMotion ? undefined : { y: y1, rotate: rotate1 }}
        className="absolute -top-56 -left-56 h-[36rem] w-[36rem] rounded-full bg-emerald-500/20 blur-3xl"
      />
      <motion.div
        animate={idlePulse}
        style={shouldReduceMotion ? undefined : { y: y2, rotate: rotate2 }}
        className="absolute top-1/4 -right-56 h-[32rem] w-[32rem] rounded-full bg-emerald-400/20 blur-3xl"
      />
      <motion.div
        style={shouldReduceMotion ? undefined : { y: y3, scale: scale3 }}
        className="absolute top-[58%] left-[8%] h-[28rem] w-[28rem] rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-600/20"
      />
      <motion.div
        style={shouldReduceMotion ? undefined : { y: y4 }}
        className="absolute bottom-[-12rem] right-[12%] h-[30rem] w-[30rem] rounded-full bg-emerald-500/15 blur-3xl"
      />
    </div>
  )
}
