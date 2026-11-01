"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { ArrowUpRight, Plus } from "lucide-react";
import { useId, useRef, useState } from "react";
import { services } from "@/content/site";
import { hasMedia, media } from "@/lib/media";
import { prefillEnquiry } from "@/lib/enquiry-events";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { FadeIn, MaskText, SectionLabel } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Services() {
  const [open, setOpen] = useState<number | null>(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const baseId = useId();

  // Floating preview that trails the cursor and leans with its velocity.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 22, mass: 0.6 });
  const y = useSpring(my, { stiffness: 180, damping: 22, mass: 0.6 });
  const vx = useVelocity(x);
  const rotate = useTransform(vx, [-2000, 2000], [-10, 10], { clamp: true });

  return (
    <section id="services" aria-labelledby="services-title" className="relative py-28 md:py-44">
      <div className="gutter grid gap-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <SectionLabel index="03">Events we cover</SectionLabel>
          <h2 id="services-title" className="display mt-6 text-[clamp(2.75rem,7vw,6.75rem)]">
            <MaskText className="block">Built for days</MaskText>
            <MaskText delay={0.1} className="block italic">
              that can&rsquo;t be redone.
            </MaskText>
          </h2>
        </div>
        <FadeIn className="self-end text-base leading-relaxed text-mute md:col-span-4 md:col-start-9">
          Every booking can include photography, film or both, planned as one, so every
          image and every frame tells the same story.
        </FadeIn>
      </div>

      <div
        ref={area}
        className="relative mt-16 md:mt-24"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          mx.set(e.clientX);
          my.set(e.clientY);
        }}
        onPointerLeave={() => setHovered(null)}
      >
        <ul className="border-t border-line">
          {services.map((s, i) => {
            const isOpen = open === i;
            const panelId = `${baseId}-panel-${i}`;
            const m = media(s.media, `${s.title} photography`, [16, 10]);
            return (
              <li key={s.title} className="border-b border-line">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(i)}
                    onPointerLeave={() => setHovered(null)}
                    data-cursor={isOpen ? "Close" : "Open"}
                    className="gutter group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 py-6 text-left md:gap-10 md:py-9"
                  >
                    <span className="label w-8 text-mute">0{i + 1}</span>
                    <span
                      className={cn(
                        "display text-[clamp(2.75rem,8.5vw,8.5rem)] leading-[0.9] transition-[color,transform,font-style] duration-700 ease-expo",
                        hovered !== null && hovered !== i && !isOpen ? "text-dim" : "text-bone",
                        "md:group-hover:translate-x-4 md:group-hover:italic",
                      )}
                    >
                      {s.title}
                    </span>
                    <span className="flex items-center gap-6">
                      <span className="label hidden text-right text-mute md:block">{s.kicker}</span>
                      <span
                        className={cn(
                          "flex size-10 items-center justify-center rounded-full border border-line-strong transition-[transform,background-color,color] duration-500 ease-expo md:size-12",
                          isOpen && "rotate-45 bg-bone text-ink",
                        )}
                      >
                        <Plus className="size-4" />
                      </span>
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-label={s.title}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.7, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="gutter grid gap-8 pb-10 md:grid-cols-12 md:pb-14">
                        {hasMedia(s.media) && (
                          <MediaFrame
                            media={m}
                            sizes="100vw"
                            className="aspect-[16/10] w-full md:hidden"
                          />
                        )}
                        <p className="label text-mute md:hidden">{s.kicker}</p>
                        <p className="text-lg leading-relaxed text-bone/90 md:col-span-5 md:col-start-2 md:text-xl">
                          {s.description}
                        </p>
                        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-mute md:col-span-3 md:col-start-8 md:grid-cols-1">
                          {s.includes.map((inc) => (
                            <li key={inc} className="flex items-center gap-3">
                              <span className="size-1 rounded-full bg-safelight" />
                              {inc}
                            </li>
                          ))}
                        </ul>
                        <div className="md:col-span-2 md:col-start-11 md:justify-self-end">
                          <a
                            href="#contact"
                            data-book
                            data-book-type={s.enquiryType}
                            onClick={() => prefillEnquiry({ eventType: s.enquiryType })}
                            className="group inline-flex items-center gap-2 border-b border-bone/40 pb-1 text-sm transition-colors hover:border-bone"
                          >
                            Enquire about {s.title.toLowerCase()}
                            <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        {/* Cursor-following preview (desktop, fine pointer) */}
        <motion.div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-30 hidden md:block"
          style={{ x, y, rotate }}
        >
          <AnimatePresence>
            {hovered !== null && hasMedia(services[hovered].media) && (
              <motion.div
                key="preview"
                className="relative translate-x-10 -translate-y-1/2 overflow-hidden"
                style={{ width: "min(26vw, 380px)", aspectRatio: "4 / 5" }}
                initial={{ clipPath: "inset(50% 50% 50% 50%)", scale: 0.9 }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
                exit={{ clipPath: "inset(50% 50% 50% 50%)", scale: 0.9 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                {services.map((s, i) => (
                  <motion.div
                    key={s.title}
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: hovered === i ? 1 : 0, scale: hovered === i ? 1 : 1.15 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <MediaFrame
                      media={media(s.media, "", [4, 5])}
                      sizes="380px"
                      videoMode="hover"
                      active={hovered === i}
                      className="absolute inset-0"
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
