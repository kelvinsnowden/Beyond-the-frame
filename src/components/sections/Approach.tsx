"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { principles } from "@/content/site";
import { media } from "@/lib/media";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { MaskText, SectionLabel } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Why us: a sticky contact-sheet frame on the left develops a new image
 * as each principle scrolls into focus on the right.
 */
export function Approach() {
  const [active, setActive] = useState(0);

  return (
    <section id="approach" aria-labelledby="approach-title" className="gutter relative py-16 md:py-40">
      <SectionLabel index="04">Why us</SectionLabel>
      <h2 id="approach-title" className="display mt-6 max-w-5xl text-[clamp(2.75rem,7vw,6.75rem)]">
        <MaskText className="block">You live the day.</MaskText>
        <MaskText delay={0.1} className="block italic text-mute">
          We keep it.
        </MaskText>
      </h2>

      <div className="mt-10 grid gap-10 md:mt-28 md:grid-cols-12">
        {/* Sticky frame (desktop) */}
        <div className="hidden md:col-span-5 md:block">
          <div className="sticky top-[14vh]">
            <div className="relative aspect-[4/5] overflow-hidden">
              {/* Every frame is mounted (and loaded) up front; scrolling develops them in order. */}
              {principles.map((p, k) => (
                <motion.div
                  key={p.title}
                  className="absolute inset-0"
                  style={{ zIndex: k }}
                  initial={false}
                  animate={{
                    clipPath: k <= active ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
                    scale: k <= active ? 1 : 1.15,
                  }}
                  transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                >
                  <MediaFrame media={media(p.media, p.title, [4, 5])} sizes="42vw" className="absolute inset-0" />
                </motion.div>
              ))}
              <div className="crop-marks pointer-events-none absolute inset-4 opacity-40" aria-hidden />
            </div>
            <div className="label mt-4 flex justify-between text-mute" aria-hidden>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                Frame {String(active + 1).padStart(2, "0")} / {String(principles.length).padStart(2, "0")}
              </span>
              <span className="flex gap-1.5">
                {principles.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-px w-6 transition-colors duration-500",
                      i === active ? "bg-safelight" : "bg-line-strong",
                    )}
                  />
                ))}
              </span>
            </div>
          </div>
        </div>

        <ol className="md:col-span-6 md:col-start-7">
          {principles.map((p, i) => (
            <Principle key={p.title} index={i} active={active === i} onActive={() => setActive(i)} {...p} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Principle({
  index,
  title,
  body,
  media: key,
  active,
  onActive,
}: {
  index: number;
  title: string;
  body: string;
  media: string;
  active: boolean;
  onActive: () => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive();
  }, [inView, onActive]);

  return (
    <li
      ref={ref}
      className={cn(
        "border-t border-line py-10 transition-opacity duration-700 md:flex md:min-h-[62vh] md:flex-col md:justify-center md:py-0",
        active ? "md:opacity-100" : "md:opacity-25",
      )}
    >
      <MediaFrame
        media={media(key, title, [4, 3])}
        sizes="100vw"
        className="mb-8 aspect-[4/3] w-full md:hidden"
      />
      <span className="display text-7xl italic text-safelight md:text-8xl">{index + 1}</span>
      <motion.h3
        className="display mt-4 text-[clamp(2rem,3.8vw,3.75rem)] leading-[1]"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1, ease: EASE }}
      >
        {title}
      </motion.h3>
      <p className="mt-5 max-w-md text-lg leading-relaxed text-mute">{body}</p>
    </li>
  );
}
