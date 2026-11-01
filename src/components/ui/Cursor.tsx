"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Contextual cursor. Any element with data-cursor="View" (etc.) turns the
 * cursor into a labelled disc. Interactive elements enlarge the ring.
 * Disabled on touch devices and for reduced-motion users.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const [down, setDown] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 520, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 520, damping: 40, mass: 0.5 });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => {
      setEnabled(mq.matches);
      document.documentElement.classList.toggle("has-custom-cursor", mq.matches);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const t = e.target as HTMLElement | null;
      const tagged = t?.closest<HTMLElement>("[data-cursor]");
      setLabel(tagged?.dataset.cursor || null);
      setHovering(Boolean(t?.closest("a, button, [role='button'], label, select")));
    };
    const leave = () => setVisible(false);
    const dn = () => setDown(true);
    const up = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", dn);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", dn);
      window.removeEventListener("pointerup", up);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = label ? 92 : hovering ? 44 : 10;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100]"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
        animate={{
          width: size,
          height: size,
          opacity: visible ? 1 : 0,
          scale: down ? 0.85 : 1,
          backgroundColor: label ? "rgba(237,231,221,1)" : hovering ? "rgba(237,231,221,0)" : "rgba(237,231,221,1)",
          borderColor: hovering && !label ? "rgba(237,231,221,0.7)" : "rgba(237,231,221,0)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        style={{ borderWidth: 1, borderStyle: "solid", mixBlendMode: label ? "normal" : "difference" }}
      >
        <AnimatePresence mode="wait">
          {label && (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="label text-[10px] text-ink"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
