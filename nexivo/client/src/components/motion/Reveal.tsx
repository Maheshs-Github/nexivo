import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

interface Props { children: ReactNode; className?: string; delay?: number; as?: "div" | "li" | "section" | "article" }

/** Fade + 12px rise once the element is 15% visible (DESIGN.md §7). Static under reduced motion. */
export function Reveal({ children, className, delay = 0, as = "div" }: Props) {
  const reduced = useReducedMotion();
  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }
  const Cmp = motion[as];
  return (
    <Cmp className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}
      variants={revealVariants} transition={{ delay }}>
      {children}
    </Cmp>
  );
}

/** Staggers its direct <Reveal>-like children (60ms). */
export function Stagger({ children, className, as = "div" }: Omit<Props, "delay">) {
  const reduced = useReducedMotion();
  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }
  const Cmp = motion[as];
  return (
    <Cmp className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}>
      {children}
    </Cmp>
  );
}

export const StaggerItem = motion.div;
export const StaggerLi = motion.li;
