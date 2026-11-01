"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { projects } from "@/content/site";
import { media } from "@/lib/media";
import { useExperience } from "@/components/providers/Experience";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { coverOf, formatLabel } from "./ProjectCard";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Full-screen project view. The card's cover morphs into the hero
 * (shared layout), then the story and gallery unfold beneath it.
 * Gallery images are framed at their true aspect ratio: never cropped.
 */
export function ProjectViewer({
  slug,
  onClose,
  onNavigate,
}: {
  slug: string | null;
  onClose: () => void;
  onNavigate: (slug: string) => void;
}) {
  const { lockScroll } = useExperience();
  const scroller = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const idx = projects.findIndex((p) => p.slug === slug);
  const project = idx >= 0 ? projects[idx] : null;
  const prev = idx >= 0 ? projects[(idx - 1 + projects.length) % projects.length] : null;
  const next = idx >= 0 ? projects[(idx + 1) % projects.length] : null;

  useEffect(() => {
    lockScroll(Boolean(project));
  }, [project, lockScroll]);

  useEffect(() => {
    if (!project) return;
    scroller.current?.scrollTo({ top: 0 });
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && next) onNavigate(next.slug);
      if (e.key === "ArrowLeft" && prev) onNavigate(prev.slug);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, next, prev, onClose, onNavigate]);

  const film = project?.film ? media(project.film, `${project.title}, film`, [16, 9]) : null;

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="viewer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="viewer-title"
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.1 } }}
        >
          <motion.div
            className="absolute inset-0 bg-ink"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />

          {/* Controls */}
          <div className="gutter absolute inset-x-0 top-0 z-20 flex h-16 items-center justify-between md:h-20">
            <span
              className="label rounded-full border border-line bg-ink/60 px-3 py-2 text-bone/80 backdrop-blur"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {String(idx + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-2">
              {prev && (
                <button
                  type="button"
                  onClick={() => onNavigate(prev.slug)}
                  aria-label={`Previous project: ${prev.title}`}
                  className="flex size-10 items-center justify-center rounded-full border border-line-strong bg-ink/60 backdrop-blur transition-colors hover:border-bone"
                >
                  <ArrowLeft className="size-4" />
                </button>
              )}
              {next && (
                <button
                  type="button"
                  onClick={() => onNavigate(next.slug)}
                  aria-label={`Next project: ${next.title}`}
                  className="flex size-10 items-center justify-center rounded-full border border-line-strong bg-ink/60 backdrop-blur transition-colors hover:border-bone"
                >
                  <ArrowRight className="size-4" />
                </button>
              )}
              <button
                ref={closeBtn}
                type="button"
                onClick={onClose}
                className="ml-2 flex h-10 items-center gap-2 rounded-full bg-bone px-4 text-sm font-medium text-ink"
              >
                Close <X className="size-4" />
              </button>
            </div>
          </div>

          <div ref={scroller} data-lenis-prevent className="relative z-10 h-full overflow-y-auto overscroll-contain">
            <article key={project.slug}>
              {/* Hero */}
              <header className="relative h-[78svh] min-h-[480px]">
                <motion.div layoutId={`cover-${project.slug}`} className="absolute inset-0 overflow-hidden" transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}>
                  <MediaFrame media={coverOf(project)} sizes="100vw" priority className="absolute inset-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/30" />
                </motion.div>
                <div className="gutter absolute inset-x-0 bottom-0 pb-10">
                  <motion.p
                    className="label mb-4 text-bone/70"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
                  >
                    {project.category} · {formatLabel[project.format]}
                  </motion.p>
                  <h2 id="viewer-title" className="display overflow-hidden text-[clamp(2.75rem,8vw,8rem)]">
                    <motion.span
                      className="block"
                      initial={{ y: "105%" }}
                      animate={{ y: "0%" }}
                      transition={{ delay: 0.45, duration: 1.1, ease: EASE }}
                    >
                      {project.title}
                    </motion.span>
                  </h2>
                </div>
              </header>

              <motion.div
                className="gutter"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 1, ease: EASE }}
              >
                {/* Meta */}
                <dl className="grid grid-cols-2 gap-6 border-b border-line py-10 md:grid-cols-4">
                  {[
                    ["Event", project.category],
                    ["Coverage", formatLabel[project.format]],
                    ["Year", project.year],
                    ["Location", project.location],
                  ]
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k}>
                        <dt className="label text-mute">{k}</dt>
                        <dd className="mt-2 text-lg">{v}</dd>
                      </div>
                    ))}
                </dl>

                {project.summary && (
                  <p className="display max-w-4xl py-14 text-[clamp(1.6rem,3vw,2.75rem)] leading-tight">
                    {project.summary}
                  </p>
                )}

                {/* Film */}
                {film && (
                  <figure className="mt-10">
                    <MediaFrame
                      media={film}
                      videoMode="controls"
                      fit="contain"
                      className="w-full bg-black"
                      style={{ aspectRatio: `${film.width}/${film.height}`, maxHeight: "85svh" }}
                      sizes="100vw"
                    />
                    <figcaption className="label mt-3 text-mute">Film · sound on</figcaption>
                  </figure>
                )}

                {/* Gallery: editorial rhythm: full, pair, full… */}
                <div className="grid grid-cols-1 gap-4 py-10 md:grid-cols-2 md:gap-6">
                  {project.gallery.map((key, i) => {
                    const m = media(key, `${project.title}, image ${i + 1}`, i % 3 === 0 ? [3, 2] : [4, 5]);
                    const full = m.width / m.height > 1.2 && i % 3 === 0;
                    return (
                      <motion.figure
                        key={key}
                        className={cn(full && "md:col-span-2", !full && i % 3 === 2 && "md:mt-24")}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2, root: scroller }}
                        transition={{ duration: 1, ease: EASE }}
                      >
                        <MediaFrame
                          media={m}
                          sizes={full ? "100vw" : "(min-width: 768px) 50vw, 100vw"}
                          className="w-full"
                          style={{ aspectRatio: `${m.width}/${m.height}` }}
                        />
                      </motion.figure>
                    );
                  })}
                </div>

                {/* Next / CTA */}
                <div className="grid gap-6 border-t border-line py-14 md:grid-cols-2">
                  <a
                    href="#contact"
                    onClick={onClose}
                    className="group flex items-center justify-between rounded-full bg-bone px-6 py-4 text-ink"
                  >
                    <span className="text-lg font-medium">Plan your event with us</span>
                    <ArrowUpRight className="size-5 transition-transform duration-500 group-hover:rotate-45" />
                  </a>
                  {next && (
                    <button
                      type="button"
                      onClick={() => onNavigate(next.slug)}
                      className="group text-left md:text-right"
                    >
                      <span className="label text-mute">Next project</span>
                      <span className="display mt-1 block text-4xl transition-[font-style] group-hover:italic md:text-5xl">
                        {next.title} →
                      </span>
                    </button>
                  )}
                </div>
              </motion.div>
            </article>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
