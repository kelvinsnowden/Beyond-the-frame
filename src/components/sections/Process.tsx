"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { processSteps as steps } from "@/content/site";
import { MaskText, SectionLabel } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/Magnetic";

const EASE = [0.16, 1, 0.3, 1] as const;

/** How booking works: removes friction right before the enquiry form. */
export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.6"] });
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="process" aria-labelledby="process-title" className="gutter relative bg-ink-2 py-28 md:py-40">
      <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
        <div>
          <SectionLabel index="05">How it works</SectionLabel>
          <h2 id="process-title" className="display mt-6 text-[clamp(2.75rem,7vw,6.75rem)]">
            <MaskText className="block">Four steps.</MaskText>
            <MaskText delay={0.1} className="block italic">
              Zero stress.
            </MaskText>
          </h2>
        </div>
        <PillButton href="#contact" book icon={<ArrowUpRight className="size-4" />}>
          Start with step one
        </PillButton>
      </div>

      <div ref={ref} className="relative mt-16 md:mt-24">
        {/* Progress rail */}
        <div className="absolute left-[11px] top-0 h-full w-px bg-line md:left-0 md:top-[11px] md:h-px md:w-full" aria-hidden>
          <motion.div
            className="h-full w-full origin-top bg-safelight md:hidden"
            style={{ scaleY: line }}
          />
          <motion.div
            className="hidden h-full w-full origin-left bg-safelight md:block"
            style={{ scaleX: line }}
          />
        </div>

        <ol className="grid gap-12 md:grid-cols-4 md:gap-8">
          {steps.map((s, i) => (
            <motion.li
              key={s.step}
              className="relative pl-12 md:pl-0 md:pt-14"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1, ease: EASE, delay: i * 0.12 }}
            >
              <span
                className="absolute left-0 top-0 flex size-[23px] items-center justify-center rounded-full border border-line-strong bg-ink-2"
                aria-hidden
              >
                <span className="size-1.5 rounded-full bg-bone" />
              </span>
              <span className="label text-mute">Step 0{i + 1}</span>
              <h3 className="display mt-3 text-4xl md:text-5xl">{s.step}</h3>
              <p className="mt-4 max-w-xs leading-relaxed text-mute">{s.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
