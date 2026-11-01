"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useRef, useSyncExternalStore } from "react";
import { brand, contact, nav, socials } from "@/content/site";
import { useExperience } from "@/components/providers/Experience";
import { LocalTime } from "@/components/ui/Timecode";

export function Footer() {
  const { scrollTo } = useExperience();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["40%", "0%"]);
  const year = useSyncExternalStore(
    () => () => {},
    () => new Date().getFullYear(),
    () => null,
  );

  return (
    <footer ref={ref} className="relative overflow-clip border-t border-line pt-16">
      <div className="gutter grid gap-10 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="label text-mute">{brand.descriptor}</p>
          <p className="mt-3 max-w-xs text-mute">{brand.tagline}</p>
        </div>
        <nav aria-label="Footer">
          <p className="label text-mute">Explore</p>
          <ul className="mt-3 space-y-1.5">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="hover:text-mute">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="label text-mute">Social</p>
          <ul className="mt-3 space-y-1.5">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="hover:text-mute">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-between gap-6 lg:items-end">
          <div className="lg:text-right">
            <p className="label text-mute">Studio time</p>
            <LocalTime timeZone={contact.timezone} className="mt-3 block text-2xl" />
          </div>
          <button
            type="button"
            onClick={() => scrollTo(0)}
            className="group flex items-center gap-3 text-sm"
          >
            Back to top
            <span className="flex size-10 items-center justify-center rounded-full border border-line-strong transition-transform duration-500 ease-expo group-hover:-translate-y-1">
              <ArrowUp className="size-4" />
            </span>
          </button>
        </div>
      </div>

      <div className="gutter mt-16 overflow-hidden" aria-hidden>
        <motion.p
          style={{ y }}
          className="display select-none whitespace-nowrap pb-[0.08em] text-[12.4vw] leading-[0.85] tracking-[-0.045em]"
        >
          Beyond <span className="italic">the</span> Frame<span className="text-safelight">.</span>
        </motion.p>
      </div>

      <div className="gutter label flex flex-col justify-between gap-2 border-t border-line py-5 text-mute sm:flex-row">
        <span>
          © {year ?? ""} {brand.name}. All rights reserved.
        </span>
        <span>All imagery © {brand.name}</span>
      </div>
    </footer>
  );
}
