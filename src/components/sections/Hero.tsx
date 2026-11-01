"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { brand, hero } from "@/content/site";
import { media } from "@/lib/media";
import { useExperience } from "@/components/providers/Experience";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { MaskText } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/Magnetic";
import { Timecode } from "@/components/ui/Timecode";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;
const SHUTTER = [0.76, 0, 0.24, 1] as const;
const HOLD = 6500;

export function Hero() {
  const { ready } = useExperience();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const frames = hero.frames;

  // ── Sequence state ───────────────────────────────────────────────
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(-1);
  const [cycle, setCycle] = useState(0);

  const goTo = useCallback(
    (k: number) => {
      if (k === active) return;
      setPrev(active);
      setActive(k);
      setCycle((c) => c + 1);
    },
    [active],
  );

  // Auto-advance like cuts in a film; any manual pick restarts the clock.
  useEffect(() => {
    if (!ready || reduce || frames.length < 2) return;
    const id = setTimeout(() => goTo((active + 1) % frames.length), HOLD);
    return () => clearTimeout(id);
  }, [ready, reduce, frames.length, active, cycle, goTo]);

  // ── Scroll: the frame recedes into a matted print ────────────────
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const inset = useTransform(scrollYProgress, [0, 1], [0, 6]);
  const clip = useTransform(inset, (v) => `inset(${v}% ${v}% ${v}% ${v}% round ${v * 3}px)`);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const dim = useTransform(scrollYProgress, [0, 1], [0, 0.6]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  // ── Pointer parallax (fine pointers) ─────────────────────────────
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 20 });
  const py = useSpring(my, { stiffness: 60, damping: 20 });
  const tx = useTransform(px, (v) => v * -18);
  const ty = useTransform(py, (v) => v * -12);
  const headX = useTransform(px, (v) => v * 10);

  return (
    <section
      id="top"
      ref={ref}
      aria-label="Introduction"
      className="relative h-[100svh] min-h-[640px] overflow-clip bg-ink"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {/* Media plate: opens like a shutter, then recedes on scroll */}
      <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
        <motion.div
          className="absolute inset-0"
          initial={{ clipPath: "inset(34% 38% 34% 38%)" }}
          animate={ready ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
          transition={{ duration: 1.6, ease: SHUTTER }}
        >
          <motion.div className="absolute inset-0 isolate" style={{ y, scale }}>
            <motion.div className="absolute -inset-8" style={{ x: tx, y: ty }}>
              <motion.div
                className="absolute inset-0 isolate"
                initial={{ scale: 1.35 }}
                animate={ready ? { scale: 1 } : undefined}
                transition={{ duration: 2.2, ease: EASE }}
              >
                {frames.map((f, k) => {
                  const isActive = k === active;
                  const isPrev = k === prev;
                  return (
                    <motion.div
                      key={k}
                      className="hero-frame absolute inset-0 overflow-hidden"
                      style={{
                        zIndex: isActive ? 2 : isPrev ? 1 : 0,
                        ["--fpd" as string]: f.focal,
                        ["--fpm" as string]: f.focalMobile ?? f.focal,
                      }}
                      initial={false}
                      animate={{
                        clipPath: isActive || isPrev ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 0% 100%)",
                      }}
                      transition={
                        isActive && cycle > 0 ? { duration: 1.5, ease: SHUTTER } : { duration: 0, delay: 1.6 }
                      }
                    >
                      <motion.div
                        key={isActive ? `on-${cycle}` : "off"}
                        className="absolute inset-0"
                        initial={{ scale: isActive && !reduce ? 1.12 : 1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 8, ease: "linear" }}
                      >
                        <MediaFrame
                          media={media(f.media, `${f.caption}, photographed by ${brand.name}`, [16, 9])}
                          priority={k === 0}
                          sizes="100vw"
                          focal="var(--fp)"
                          className="absolute inset-0"
                        />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Legibility: kept above the frames in their own layer */}
          <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/25 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-ink/80 to-transparent" />
            <motion.div className="absolute inset-0 bg-ink" style={{ opacity: dim }} />
          </div>
        </motion.div>
      </motion.div>

      {/* Viewfinder HUD */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-20 bottom-0 z-10 md:top-24"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ duration: 1, delay: 1.4 }}
      >
        <div className="gutter label flex justify-between text-bone/80">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-safelight motion-safe:animate-[rec-pulse_1.2s_ease-in-out_infinite]" />
            Rec
            <Timecode className="ml-2 text-bone/60" />
          </span>
          <span className="hidden md:inline">{frames[active].caption}</span>
        </div>
        <div className="crop-marks absolute inset-x-[clamp(1rem,3.2vw,3rem)] top-10 bottom-6 hidden opacity-20 md:block" />
      </motion.div>

      {/* Frame selector: story-style progress, clickable */}
      <motion.div
        role="group"
        aria-label="Hero photographs"
        className="gutter absolute inset-x-0 top-[7.5rem] z-20 flex justify-end md:top-32"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ duration: 1, delay: 1.6 }}
      >
        <div className="flex gap-2">
          {frames.map((f, k) => (
            <button
              key={k}
              type="button"
              onClick={() => goTo(k)}
              aria-label={`Show photograph ${k + 1}: ${f.caption}`}
              aria-pressed={k === active}
              className="group flex flex-col items-start gap-2 py-2"
            >
              <span className="relative block h-[2px] w-10 overflow-hidden bg-bone/25 md:w-16">
                <span
                  key={k === active ? `p-${cycle}` : "idle"}
                  className={cn(
                    "absolute inset-0 origin-left bg-bone",
                    k === active
                      ? reduce
                        ? "scale-x-100"
                        : "animate-[hero-progress_var(--hold)_linear_forwards]"
                      : "scale-x-0",
                  )}
                  style={{ ["--hold" as string]: `${HOLD}ms` }}
                />
              </span>
              <span
                className={cn(
                  "label text-[10px] transition-colors",
                  k === active ? "text-bone" : "text-bone/50 group-hover:text-bone",
                )}
              >
                {String(k + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Copy */}
      <motion.div
        style={{ y: textY }}
        className="gutter relative z-10 flex h-full flex-col justify-end pb-24 sm:pb-10 md:pb-14"
      >
        <motion.p
          className="label mb-5 flex items-center gap-3 text-bone/85 md:mb-8"
          initial={{ opacity: 0, x: -12 }}
          animate={ready ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 1, ease: EASE, delay: 0.7 }}
        >
          <span className="h-px w-8 bg-bone/60" />
          {hero.eyebrow}
        </motion.p>

        <div className="relative">
          <motion.h1
            style={{ x: headX }}
            className="display text-[clamp(4.25rem,19vw,8rem)] [text-shadow:0_2px_40px_rgb(11_10_9/0.35)] md:text-[clamp(6rem,11.5vw,13.5rem)]"
          >
            <MaskText play={ready} delay={0.55} className="block">
              {hero.headline[0]}
            </MaskText>
            <MaskText play={ready} delay={0.68} className="block md:pl-[12vw]">
              {hero.headline[1]}
            </MaskText>
            <MaskText play={ready} delay={0.81} className="block italic">
              {hero.headline[2]}
            </MaskText>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-sm text-base leading-relaxed text-bone/90 md:max-w-md md:text-lg lg:absolute lg:bottom-[0.9vw] lg:right-0 lg:mt-0 lg:max-w-[24rem] xl:max-w-[27rem]"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1.2, ease: EASE, delay: 1.2 }}
          >
            {hero.statement}
          </motion.p>
        </div>

        <motion.div
          className="mt-8 flex flex-wrap items-center gap-3 md:mt-10 md:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1.2, ease: EASE, delay: 1.35 }}
        >
          <PillButton href={hero.primaryCta.href} book icon={<ArrowUpRight className="size-4" />}>
            {hero.primaryCta.label}
          </PillButton>
          <PillButton href={hero.secondaryCta.href} variant="ghost" className="bg-ink/30 backdrop-blur-sm">
            {hero.secondaryCta.label}
          </PillButton>

          <a
            href="#studio"
            className="label ml-auto hidden items-center gap-3 text-bone/70 transition-colors hover:text-bone md:flex"
            aria-label="Scroll to the studio introduction"
          >
            Scroll
            <span className="relative block h-10 w-px overflow-hidden bg-bone/15">
              <span className="absolute inset-0 bg-bone motion-safe:animate-[scroll-line_2.2s_var(--ease-film)_infinite]" />
            </span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
