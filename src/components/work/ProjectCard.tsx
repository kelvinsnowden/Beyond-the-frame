"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useState } from "react";
import type { Project } from "@/content/site";
import { media, type Media } from "@/lib/media";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { cn } from "@/lib/cn";

/** Card heights on desktop follow a rhythm so the strip reads like an edit, not a grid. */
/** h = share of the strip height (--th), which already excludes header & progress rows. */
const RHYTHM = [
  { h: 1, align: "self-start" },
  { h: 0.74, align: "self-end" },
  { h: 0.88, align: "self-center" },
  { h: 0.8, align: "self-start" },
  { h: 0.94, align: "self-end" },
  { h: 0.7, align: "self-center" },
];
/** Height of the caption row under each image. */
const CAPTION = "3.5rem";

export const formatLabel = { photo: "Photography", film: "Film", both: "Photo + Film" } as const;

export function coverOf(p: Project): Media {
  return media(p.cover, `${p.title}, ${p.category}`, p.aspect ?? [4, 5]);
}

export function ProjectCard({
  project,
  index,
  desktop,
  onOpen,
}: {
  project: Project;
  index: number;
  desktop: boolean;
  onOpen: (el: HTMLElement) => void;
}) {
  const [hover, setHover] = useState(false);
  // 3D tilt toward the pointer
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const rotY = useSpring(useTransform(tx, [-0.5, 0.5], [-7, 7]), { stiffness: 160, damping: 18 });
  const rotX = useSpring(useTransform(ty, [-0.5, 0.5], [6, -6]), { stiffness: 160, damping: 18 });
  const glareX = useTransform(tx, [-0.5, 0.5], ["0%", "100%"]);
  const glare = useTransform(glareX, (v) => `radial-gradient(circle at ${v} 30%, rgb(237 231 221 / 0.18), transparent 55%)`);
  const cover = coverOf(project);
  const preview = project.preview ? media(project.preview, "", project.aspect) : null;
  const hasPreview = preview && preview.kind === "video";
  const ratio = Math.min(1.8, Math.max(0.62, cover.width / cover.height));
  const r = RHYTHM[index % RHYTHM.length];

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn("shrink-0 snap-start", desktop && r.align)}
      style={
        desktop
          ? {
              height: `calc(var(--th) * ${r.h})`,
              width: `calc((var(--th) * ${r.h} - ${CAPTION}) * ${ratio})`,
            }
          : { width: ratio > 1.1 ? "86vw" : "72vw" }
      }
    >
      <button
        type="button"
        onClick={(e) => onOpen(e.currentTarget)}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || !desktop) return;
          const r = e.currentTarget.getBoundingClientRect();
          tx.set((e.clientX - r.left) / r.width - 0.5);
          ty.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => {
          setHover(false);
          tx.set(0);
          ty.set(0);
        }}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        data-cursor={project.format === "photo" ? "View" : "Play"}
        aria-label={`Open project: ${project.title} (${project.category})`}
        className="group flex h-full w-full flex-col text-left"
      >
        <motion.div
          layoutId={`cover-${project.slug}`}
          className="relative w-full flex-1 overflow-hidden bg-ink-3"
          style={
            desktop
              ? { rotateX: rotX, rotateY: rotY, transformPerspective: 1000 }
              : { aspectRatio: String(ratio) }
          }
        >
          <div className="absolute inset-0 transition-transform duration-[1.4s] ease-expo group-hover:scale-[1.06]">
            <MediaFrame
              media={cover}
              sizes="(min-width: 1024px) 45vw, 86vw"
              className="absolute inset-0"
            />
            {hasPreview && (
              <div
                className={cn(
                  "absolute inset-0 transition-opacity duration-700",
                  hover ? "opacity-100" : "opacity-0",
                )}
              >
                <MediaFrame media={preview} videoMode="hover" active={hover} sizes="45vw" className="absolute inset-0" />
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
          {desktop && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-500 group-hover:opacity-100"
              style={{ backgroundImage: glare }}
            />
          )}
          <div className="label absolute inset-x-4 top-4 flex justify-between text-bone/80">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span className="rounded-full border border-bone/30 px-2.5 py-1 backdrop-blur-sm">
              {formatLabel[project.format]}
            </span>
          </div>
        </motion.div>

        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="display text-2xl leading-tight md:text-[1.9rem]">
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-700 ease-expo group-hover:bg-[length:100%_1px]">
              {project.title}
            </span>
          </h3>
          <span className="label shrink-0 text-mute">{project.category}</span>
        </div>
      </button>
    </motion.li>
  );
}
