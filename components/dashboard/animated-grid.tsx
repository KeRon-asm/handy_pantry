"use client"

import { Children, type ReactNode } from "react"
import { motion, MotionConfig, type Variants } from "motion/react"

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 240, damping: 24 },
  },
}

interface AnimatedGridProps {
  children: ReactNode
  /** Classes for the grid container itself (columns, gaps, margins). */
  className?: string
  /** Seconds before the first child starts animating. */
  delay?: number
  /** Seconds between each child's entrance. */
  stagger?: number
}

/**
 * Drop-in replacement for a grid <div>. Children fade and slide in one after
 * another on mount, and lift slightly (with a soft green glow) on hover.
 *
 * Server components can be passed in as children, so the cards themselves stay
 * server-rendered; only this thin wrapper ships as client JS.
 *
 * Honors prefers-reduced-motion: movement is disabled, and cards just fade in.
 */
export function AnimatedGrid({ children, className, delay = 0, stagger = 0.07 }: AnimatedGridProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { delayChildren: delay, staggerChildren: stagger } } }}
      >
        {Children.toArray(children).map((child, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            // flex + [&>*]:flex-1 keeps each card stretching to the full row
            // height, exactly as it did when cards were direct grid children.
            className="flex flex-col rounded-xl transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/10 [&>*]:flex-1"
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    </MotionConfig>
  )
}
