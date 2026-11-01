"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { Play } from "lucide-react";
import { useRef, useState } from "react";
import { featuredFilm } from "@/content/site";
import { media } from "@/lib/media";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Magnetic } from "@/components/ui/Magnetic";
import { MaskText, SectionLabel } from "@/components/ui/Reveal";
import { FilmPlayer } from "./FilmPlayer";

/**
 * "Now showing": the featured film. A muted loop widens to full bleed as it
 * scrolls into view; one click opens the full film with sound.
 */
export function FilmShowcase() {
  const featured = featuredFilm.film && media(featuredFilm.film).kind === "video" ? featuredFilm : undefined;
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const inset = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const clip = useTransform(inset, (v) => `inset(${v * 0.6}% ${v}% ${v * 0.6}% ${v}% round ${v * 1.4}px)`);
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);

  if (!featured?.film) return null;
  const film = media(featured.film, `${featured.title}, film`);
  if (film.kind !== "video") return null;
  const loop = media(featured.preview ?? featured.film, "", [16, 9]);
  const minutes = film.duration ? Math.round(film.duration / 60) : 0;

  return (
    <section id="film" ref={ref} aria-labelledby="film-title" className="relative py-14 md:py-36">
      <div className="gutter mb-8 flex flex-col justify-between gap-6 md:mb-14 md:flex-row md:items-end">
        <div>
          <SectionLabel index="★">Now showing</SectionLabel>
          <h2 id="film-title" className="display mt-6 text-[clamp(2.75rem,7vw,6.75rem)]">
            <MaskText className="block">{featured.title}</MaskText>
            <MaskText delay={0.1} className="block italic text-mute">
              {featured.tagline ?? "In film."}
            </MaskText>
          </h2>
        </div>
        <p className="max-w-sm text-base leading-relaxed text-mute">{featured.summary}</p>
      </div>

      <motion.div style={{ clipPath: clip }} className="relative">
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-cursor="Play film"
          aria-label={`Play the film: ${featured.title}`}
          className="group relative block aspect-[4/5] w-full overflow-hidden sm:aspect-video md:max-h-[92vh]"
        >
          <motion.div className="absolute inset-0" style={{ scale }}>
            <MediaFrame media={loop} sizes="100vw" focal="50% 40%" className="absolute inset-0" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/30 transition-colors duration-700 group-hover:from-ink/60" />

          <div className="gutter label absolute inset-x-0 top-6 flex justify-between text-bone/80">
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-safelight motion-safe:animate-[rec-pulse_1.2s_ease-in-out_infinite]" />
              Preview
            </span>
            <span>Sound on in the full film</span>
          </div>

          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Magnetic strength={0.2}>
              <span className="relative flex size-28 items-center justify-center rounded-full bg-bone text-ink transition-transform duration-700 ease-expo group-hover:scale-110 md:size-36">
                <span className="absolute inset-0 rounded-full border border-bone/60 motion-safe:animate-ping [animation-duration:2.4s]" />
                <Play className="ml-1 size-7 fill-current md:size-9" />
              </span>
            </Magnetic>
          </span>

          <span className="gutter absolute inset-x-0 bottom-6 flex items-end justify-between text-left md:bottom-10">
            <span className="display text-3xl md:text-5xl">
              Watch the <span className="italic">film</span>
            </span>
            <span className="label text-bone/70">{featured.year ?? ""}{minutes ? ` · ${minutes} min` : ""}</span>
          </span>
        </button>
      </motion.div>

      <FilmPlayer film={film} title={featured.title} open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
