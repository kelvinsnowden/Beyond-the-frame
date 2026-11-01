"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { testimonials } from "@/content/site";
import { media } from "@/lib/media";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { SectionLabel } from "@/components/ui/Reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Client words. Renders only real testimonials from content/site.ts.
 * With none supplied it disappears in production, and shows a quiet
 * authoring hint in development.
 */
export function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    const id = setInterval(() => setI((v) => (v + 1) % count), 8000);
    return () => clearInterval(id);
  }, [count, paused]);

  if (count === 0) {
    if (process.env.NODE_ENV === "production") return null;
    return (
      <section aria-hidden className="gutter py-16">
        <div className="label border border-dashed border-line-strong p-6 text-mute">
          Dev note — Testimonials section is hidden until real client words are added to
          <code className="mx-1 text-bone">testimonials</code> in src/content/site.ts.
        </div>
      </section>
    );
  }

  const t = testimonials[i];
  const m = t.media ? media(t.media, "", [4, 5]) : null;

  return (
    <section
      id="words"
      aria-labelledby="words-title"
      aria-roledescription="carousel"
      className="gutter relative py-28 md:py-40"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <SectionLabel index="06">Kind words</SectionLabel>
      <h2 id="words-title" className="sr-only">
        Testimonials
      </h2>

      <div className="mt-14 grid items-end gap-10 md:grid-cols-12">
        {m && (
          <div className="relative aspect-[4/5] overflow-hidden md:col-span-4">
            <AnimatePresence initial={false}>
              <motion.div
                key={i}
                className="absolute inset-0"
                initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
              >
                <MediaFrame media={m} sizes="33vw" className="absolute inset-0" />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <div className={m ? "md:col-span-7 md:col-start-6" : "md:col-span-10"} aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <blockquote className="display text-[clamp(1.9rem,4.2vw,4.25rem)] leading-[1.02]">
                <span className="text-safelight">&ldquo;</span>
                {t.quote}
                <span className="text-safelight">&rdquo;</span>
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <span className="h-px w-10 bg-line-strong" />
                <span>
                  <span className="block">{t.name}</span>
                  {t.context && <span className="label text-mute">{t.context}</span>}
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>

          {count > 1 && (
            <div className="mt-12 flex items-center gap-3">
              <button
                type="button"
                aria-label="Previous testimonial"
                onClick={() => setI((i - 1 + count) % count)}
                className="flex size-12 items-center justify-center rounded-full border border-line-strong hover:border-bone"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Next testimonial"
                onClick={() => setI((i + 1) % count)}
                className="flex size-12 items-center justify-center rounded-full border border-line-strong hover:border-bone"
              >
                <ArrowRight className="size-4" />
              </button>
              <span className="label ml-3 text-mute" style={{ fontVariantNumeric: "tabular-nums" }}>
                {String(i + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
