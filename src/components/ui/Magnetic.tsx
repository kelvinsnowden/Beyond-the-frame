"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Subtle magnetic pull toward the pointer (fine pointers only). */
export function Magnetic({
  children,
  strength = 0.3,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Primary pill button with a rolling-label hover. Renders <a> or <button>. */
export function PillButton({
  children,
  href,
  onClick,
  type = "button",
  variant = "solid",
  className,
  disabled,
  icon,
}: {
  children: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "solid" | "ghost" | "red";
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  const styles = {
    solid: "bg-bone text-ink",
    ghost: "border border-line-strong text-bone hover:border-bone",
    red: "bg-safelight text-bone",
  }[variant];
  const inner = (
    <>
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-expo group-hover:-translate-y-full">
          {children}
        </span>
        <span
          aria-hidden
          className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-expo group-hover:translate-y-0"
        >
          {children}
        </span>
      </span>
      {icon && (
        <span className="transition-transform duration-500 ease-expo group-hover:translate-x-1 group-hover:-rotate-45">
          {icon}
        </span>
      )}
    </>
  );
  const cls = cn(
    "group inline-flex h-12 items-center gap-3 rounded-full px-6 text-sm font-medium tracking-tight transition-colors duration-300 disabled:opacity-60",
    styles,
    className,
  );
  return (
    <Magnetic>
      {href ? (
        <a href={href} className={cls} onClick={onClick}>
          {inner}
        </a>
      ) : (
        <button type={type} className={cls} onClick={onClick} disabled={disabled}>
          {inner}
        </button>
      )}
    </Magnetic>
  );
}
