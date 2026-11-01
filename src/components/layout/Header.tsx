"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { brand, hero, nav } from "@/content/site";
import { useExperience } from "@/components/providers/Experience";
import { MenuOverlay } from "./MenuOverlay";
import { cn } from "@/lib/cn";
import { Wordmark } from "@/components/ui/Wordmark";

export function Header() {
  const { ready } = useExperience();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > 240 && y > prev + 2 && !open);
    if (y < prev - 2) setHidden(false);
  });

  // Track which section is in view for the nav indicator.
  useEffect(() => {
    const ids = nav.map((n) => n.href.slice(1));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={{ y: "-100%" }}
        animate={{ y: ready && !hidden ? "0%" : "-100%" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: ready && !scrolled ? 0.9 : 0 }}
      >
        <div
          className={cn(
            "gutter flex h-16 items-center justify-between transition-[background-color,backdrop-filter,border-color] duration-500 md:h-20",
            scrolled && !open
              ? "border-b border-line bg-ink/70 backdrop-blur-xl"
              : "border-b border-transparent",
          )}
        >
          <a href="#top" className="group flex items-baseline gap-2" aria-label={`${brand.name} — home`}>
            <Wordmark className="text-[1.45rem] leading-none md:text-[1.75rem]" />
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => {
                const isActive = active === item.href.slice(1);
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "relative px-3 py-2 text-sm tracking-tight transition-colors duration-300",
                        isActive ? "text-bone" : "text-mute hover:text-bone",
                      )}
                    >
                      {item.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-dot"
                          className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-safelight"
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <a
              href={hero.primaryCta.href}
              className="group hidden h-10 items-center gap-2 rounded-full bg-bone px-5 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.03] sm:inline-flex"
            >
              {hero.primaryCta.label}
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
            </a>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="relative flex h-10 items-center gap-3 rounded-full border border-line-strong px-4 text-sm transition-colors hover:border-bone lg:hidden"
            >
              <span className="relative block h-[9px] w-4" aria-hidden>
                <span
                  className={cn(
                    "absolute left-0 top-0 h-px w-full bg-bone transition-transform duration-500 ease-expo",
                    open && "translate-y-1 rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-px w-full bg-bone transition-transform duration-500 ease-expo",
                    open && "-translate-y-1 -rotate-45",
                  )}
                />
              </span>
              <span>{open ? "Close" : "Menu"}</span>
            </button>
          </div>
        </div>
      </motion.header>

      <MenuOverlay open={open} onClose={() => setOpen(false)} />
      <BookingBar />
    </>
  );
}

/**
 * Mobile-only sticky conversion bar. Appears after the hero and gets out of
 * the way once the enquiry form is on screen.
 */
function BookingBar() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setShow(y > window.innerHeight * 0.9));

  useEffect(() => {
    // Hide while the enquiry form or the footer is on screen.
    const targets = [document.getElementById("contact"), document.querySelector("footer")].filter(
      (el): el is HTMLElement => Boolean(el),
    );
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target, e.isIntersecting));
        setContactVisible([...seen.values()].some(Boolean));
      },
      { threshold: 0.05 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {show && !contactVisible && (
        <motion.div
          initial={{ y: "120%" }}
          animate={{ y: "0%" }}
          exit={{ y: "120%" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-3 bottom-3 z-40 sm:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <a
            href="#contact"
            className="flex h-14 items-center justify-between rounded-full border border-line bg-ink/80 pl-5 pr-1.5 backdrop-blur-xl"
          >
            <span className="flex items-center gap-2 text-sm">
              <span className="size-1.5 rounded-full bg-safelight motion-safe:animate-[rec-pulse_1.4s_ease-in-out_infinite]" />
              Now booking
            </span>
            <span className="flex h-11 items-center gap-2 rounded-full bg-bone px-5 text-sm font-medium text-ink">
              {hero.primaryCta.label}
              <ArrowUpRight className="size-4" />
            </span>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
