"use client"

import { useEffect, useRef } from "react"
import { animate, useInView, useReducedMotion } from "motion/react"

interface CountUpProps {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  /** Seconds the count takes. */
  duration?: number
  /** Seconds to wait before counting, handy for syncing with an entrance animation. */
  delay?: number
  className?: string
}

// Fixed locale on purpose: the server and the browser must format identically,
// otherwise React reports a hydration mismatch (e.g. "1,234.50" vs "1.234,50").
function formatNumber(value: number, decimals: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Number that counts up from 0 when it scrolls into view.
 *
 * The DOM text is updated directly on every animation frame instead of going
 * through React state, so a count-up doesn't re-render the component 60x/sec.
 * When the value changes later (e.g. after a data refresh) it counts from the
 * number currently on screen rather than restarting at 0.
 */
export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.1,
  delay = 0,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const current = useRef(0)
  const inView = useInView(ref, { once: true })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const render = (n: number) => {
      node.textContent = `${prefix}${formatNumber(n, decimals)}${suffix}`
    }

    if (reduceMotion) {
      current.current = value
      render(value)
      return
    }
    if (!inView) return

    const controls = animate(current.current, value, {
      duration,
      delay,
      ease: "easeOut",
      onUpdate: (n) => {
        current.current = n
        render(n)
      },
      onComplete: () => {
        current.current = value
        render(value)
      },
    })
    return () => controls.stop()
  }, [inView, value, decimals, prefix, suffix, duration, delay, reduceMotion])

  const finalText = `${prefix}${formatNumber(value, decimals)}${suffix}`

  return (
    <>
      {/* Screen readers get the final value immediately; the animated copy is hidden from them. */}
      <span className="sr-only">{finalText}</span>
      <span ref={ref} aria-hidden="true" className={className}>
        {`${prefix}${formatNumber(0, decimals)}${suffix}`}
      </span>
    </>
  )
}
