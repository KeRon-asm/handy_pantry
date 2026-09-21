import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Springy "grow" effect for icons.
 *
 * The overshoot easing (cubic-bezier with y > 1) makes the icon swell slightly
 * past its target size and settle back, which reads as bouncy without needing
 * any JS animation. Because it is pure CSS this works inside server components
 * and adds nothing to the client bundle.
 *
 * - on="parent" (default): grows when the cursor is anywhere over the nearest
 *   ancestor marked with the `group` class (e.g. the whole button). The icon is
 *   only ~20px wide, so this is the more forgiving hover target.
 * - on="self": grows only when the cursor is directly over the icon itself.
 *
 * Respects prefers-reduced-motion.
 */
const BASE =
  "inline-flex transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none"

const TRIGGERS = {
  parent:
    "group-hover:scale-125 group-active:scale-95 motion-reduce:group-hover:scale-100 motion-reduce:group-active:scale-100",
  self: "hover:scale-125 active:scale-95 motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
} as const

interface HoverIconProps {
  children: ReactNode
  on?: keyof typeof TRIGGERS
  className?: string
}

export function HoverIcon({ children, on = "parent", className }: HoverIconProps) {
  return <span className={cn(BASE, TRIGGERS[on], className)}>{children}</span>
}
