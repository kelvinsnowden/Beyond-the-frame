"use client";

import { AnimatePresence, animate, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { brand } from "@/content/site";
import { useExperience } from "@/components/providers/Experience";

/**
 * Opening sequence: a frame counter runs to 100 while the wordmark develops,
 * then the black "darkroom" lifts like a shutter to reveal the hero.
 * Server-rendered with a CSS failsafe so content is never trapped behind it.
 */
export function Preloader() {
  const { setReady } = useExperience();
  const [done, setDone] = useState(false);
  const counter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => {
        setDone(true);
        setReady(true);
      });
      return () => cancelAnimationFrame(id);
    }
    const controls = animate(0, 100, {
      duration: 1.5,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => {
        if (counter.current) counter.current.textContent = String(Math.round(v)).padStart(3, "0");
      },
      onComplete: () => {
        setDone(true);
        setTimeout(() => setReady(true), 250);
      },
    });
    return () => controls.stop();
  }, [setReady]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          role="presentation"
          className="fixed inset-0 z-[95] flex flex-col justify-between bg-ink p-5 md:p-10 [animation:preloader-failsafe_0s_4s_forwards]"
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <style>{`@keyframes preloader-failsafe{to{visibility:hidden}}`}</style>
          <div className="label flex justify-between text-mute">
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-safelight motion-safe:animate-[rec-pulse_1s_ease-in-out_infinite]" />
              Developing
            </span>
            <span>{brand.descriptor}</span>
          </div>

          <div className="flex items-end justify-between gap-6">
            <div className="display text-[19vw] leading-[0.86] md:text-[11.5vw]">
              {["Beyond", "the Frame."].map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <motion.span
                    className="block"
                    initial={{ y: "105%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.12 }}
                  >
                    {i === 1 ? (
                      <>
                        <span className="italic">the</span> Frame<span className="text-safelight">.</span>
                      </>
                    ) : (
                      line
                    )}
                  </motion.span>
                </span>
              ))}
              <span className="sr-only">{brand.name}</span>
            </div>
            <span
              ref={counter}
              className="label mb-2 text-base text-bone md:text-xl"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              000
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
