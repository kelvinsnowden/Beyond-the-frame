"use client";

import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ExperienceCtx = {
  /** True once the preloader has handed over to the page. */
  ready: boolean;
  setReady: (v: boolean) => void;
  /** Pause / resume page scrolling (overlays, menus). */
  lockScroll: (locked: boolean) => void;
  scrollTo: (target: string | number | HTMLElement) => void;
};

const Ctx = createContext<ExperienceCtx | null>(null);

export function useExperience() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useExperience must be used inside <Experience>");
  return v;
}

export function Experience({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: { offset: 0 },
      autoRaf: true,
      prevent: (node) => node.closest?.("[data-lenis-prevent]") !== null,
    });
    lenis.current = instance;
    return () => {
      instance.destroy();
      lenis.current = null;
    };
  }, []);

  const lockScroll = useCallback((locked: boolean) => {
    const root = document.documentElement;
    if (locked) {
      lenis.current?.stop();
      root.style.overflow = "hidden";
    } else {
      lenis.current?.start();
      root.style.overflow = "";
    }
  }, []);

  const scrollTo = useCallback((target: string | number | HTMLElement) => {
    if (lenis.current) {
      lenis.current.scrollTo(target, { duration: 1.4 });
      return;
    }
    const el =
      typeof target === "string" ? document.querySelector(target) : typeof target === "number" ? null : target;
    if (typeof target === "number") window.scrollTo({ top: target });
    else el?.scrollIntoView();
  }, []);

  const value = useMemo(() => ({ ready, setReady, lockScroll, scrollTo }), [ready, lockScroll, scrollTo]);

  return (
    <Ctx.Provider value={value}>
      <MotionConfig reducedMotion="user" transition={{ ease: [0.16, 1, 0.3, 1] }}>
        {children}
      </MotionConfig>
    </Ctx.Provider>
  );
}
