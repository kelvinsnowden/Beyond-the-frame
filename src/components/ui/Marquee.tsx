"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/cn";

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/**
 * Infinite marquee whose speed and direction respond to scroll velocity.
 * Purely decorative — hidden from assistive tech.
 */
export function Marquee({
  items,
  baseVelocity = -2,
  className,
}: {
  items: string[];
  baseVelocity?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const dir = useRef(1);
  const tx = useTransform(x, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let move = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * f;
    x.set(x.get() + move);
  });

  const row = (
    <span className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className={i % 2 ? "italic" : "text-outline"}>{t}</span>
          <span className="mx-[3vw] inline-block size-[1.2vw] min-h-2 min-w-2 rounded-full bg-safelight" />
        </span>
      ))}
    </span>
  );

  return (
    <div aria-hidden className={cn("overflow-hidden whitespace-nowrap", className)}>
      <motion.div className="flex w-max" style={{ x: tx }}>
        {row}
        {row}
      </motion.div>
    </div>
  );
}
