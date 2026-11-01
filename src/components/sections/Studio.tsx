"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { studio } from "@/content/site";
import { media } from "@/lib/media";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ClipReveal, FadeIn, MaskText, ScrubText, SectionLabel } from "@/components/ui/Reveal";

export function Studio() {
  const collage = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: collage, offset: ["start end", "end start"] });
  const slow = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const fast = useTransform(scrollYProgress, [0, 1], ["22%", "-22%"]);
  const mid = useTransform(scrollYProgress, [0, 1], ["40%", "-30%"]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-4, 3]);

  const [a, b, c] = studio.media;

  return (
    <section id="studio" aria-labelledby="studio-title" className="gutter relative py-28 md:py-44">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <SectionLabel index="01">{studio.label}</SectionLabel>
        </div>
        <FadeIn className="md:col-span-5 md:col-start-8">
          <dl className="border-l border-line pl-5">
            <dt className="flex items-baseline gap-3">
              <span className="display text-3xl italic">{studio.definition.word}</span>
              <span className="label text-mute">{studio.definition.partOfSpeech}</span>
            </dt>
            <dd className="mt-3 max-w-sm text-sm leading-relaxed text-mute">{studio.definition.meaning}</dd>
          </dl>
        </FadeIn>
      </div>

      <h2 id="studio-title" className="sr-only">
        About the studio
      </h2>
      <ScrubText
        text={studio.statement}
        className="display mt-16 max-w-[18ch] text-[clamp(2.4rem,6.4vw,6.75rem)] leading-[0.98] tracking-[-0.03em] md:mt-24 lg:max-w-[20ch]"
      />

      {/* Collage: three plates moving at different depths */}
      <div ref={collage} className="relative mt-24 grid grid-cols-12 gap-3 md:mt-40 md:gap-6">
        <motion.div style={{ y: slow }} className="col-span-8 md:col-span-5">
          <ClipReveal>
            <MediaFrame
              media={media(a, "Portrait of a guest in ceremony attire", [4, 5])}
              sizes="(min-width: 768px) 40vw, 66vw"
              className="aspect-[4/5] w-full"
            />
          </ClipReveal>
        </motion.div>

        <div className="col-span-4 flex flex-col justify-between md:col-span-2 md:col-start-6">
          <ul className="display mt-4 space-y-1 text-[clamp(1.6rem,3vw,3rem)] italic leading-none md:mt-16">
            {studio.pillars.map((p, i) => (
              <li key={p} className="overflow-hidden">
                <MaskText delay={i * 0.12}>{`${p}.`}</MaskText>
              </li>
            ))}
          </ul>
          <motion.div
            style={{ y: mid, rotate }}
            className="relative z-10 -ml-[60%] mb-10 w-[150%] shadow-2xl shadow-black/60 md:-ml-[40%] md:w-[140%]"
          >
            <MediaFrame
              media={media(c, "A couple on the terrace in ceremony attire", [4, 5])}
              sizes="(min-width: 768px) 18vw, 40vw"
              focal="50% 30%"
              className="aspect-[4/5] w-full ring-1 ring-line"
            />
          </motion.div>
        </div>

        <motion.div style={{ y: fast }} className="col-span-10 col-start-3 mt-10 md:col-span-5 md:col-start-8 md:mt-48">
          <ClipReveal from="right" delay={0.15}>
            <MediaFrame
              media={media(b, "Guests dancing with fans at a traditional ceremony", [5, 4])}
              sizes="(min-width: 768px) 40vw, 80vw"
              className="aspect-[5/4] w-full"
            />
          </ClipReveal>
          <FadeIn className="mt-5 flex justify-between gap-6 text-sm text-mute">
            <span className="label">Fig. 02</span>
            <span className="max-w-[22rem] text-right">
              We blend in, read the room and stay a beat ahead of every moment worth keeping.
            </span>
          </FadeIn>
        </motion.div>
      </div>
    </section>
  );
}
