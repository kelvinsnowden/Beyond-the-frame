"use client";

import Image from "next/image";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import type { EmptyPlate as EmptyPlateT, Media, VideoAsset } from "@/lib/media";
import { cn } from "@/lib/cn";

type Props = {
  media: Media;
  sizes?: string;
  priority?: boolean;
  /** cover crops to the frame; contain shows the full, uncropped work. */
  fit?: "cover" | "contain";
  /** Focal point for cover crops, e.g. "50% 30%". */
  focal?: string;
  /**
   * ambient — muted loop while visible (backgrounds, hero)
   * hover   — plays only while `active` is true (project previews)
   * controls — native controls, user-initiated (project films)
   */
  videoMode?: "ambient" | "hover" | "controls";
  active?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function MediaFrame({
  media,
  sizes = "100vw",
  priority,
  fit = "cover",
  focal = "50% 50%",
  videoMode = "ambient",
  active = false,
  className,
  style,
}: Props) {
  if (media.kind === "empty") return <EmptyPlate plate={media} className={className} style={style} />;

  if (media.kind === "image") {
    return (
      <div className={cn(pos(className), "overflow-hidden bg-ink-3", className)} style={style}>
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder={media.blur ? "blur" : "empty"}
          blurDataURL={media.blur}
          quality={82}
          className={fit === "cover" ? "object-cover" : "object-contain"}
          style={{ objectPosition: focal }}
        />
      </div>
    );
  }

  return (
    <VideoFrame
      video={media}
      priority={priority}
      fit={fit}
      focal={focal}
      mode={videoMode}
      active={active}
      className={className}
      style={style}
      sizes={sizes}
    />
  );
}

const noopSubscribe = () => () => {};
function isLightConnection() {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  return Boolean(
    window.innerWidth < 900 || conn?.saveData || /(^|-)2g|3g/.test(conn?.effectiveType ?? ""),
  );
}

function VideoFrame({
  video,
  priority,
  fit,
  focal,
  mode,
  active,
  className,
  style,
  sizes,
}: {
  video: VideoAsset;
  priority?: boolean;
  fit: "cover" | "contain";
  focal: string;
  mode: "ambient" | "hover" | "controls";
  active: boolean;
  className?: string;
  style?: CSSProperties;
  sizes: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  // `once` keeps the source attached after the first approach (no reloads).
  const near = useInView(wrap, { margin: "300px 0px", once: true });
  const visible = useInView(wrap, { amount: 0.15 });
  const light = useSyncExternalStore(noopSubscribe, isLightConnection, () => false);
  const [playing, setPlaying] = useState(false);
  const src = near || priority ? (light && video.srcSmall ? video.srcSmall : video.src) : null;

  const shouldPlay =
    mode === "ambient" ? visible && !reduce : mode === "hover" ? active && visible : false;

  useEffect(() => {
    const el = ref.current;
    if (!el || !src || mode === "controls") return;
    if (shouldPlay) el.play().catch(() => {});
    else el.pause();
  }, [shouldPlay, src, mode]);

  const objectFit = fit === "cover" ? "object-cover" : "object-contain";

  return (
    <div ref={wrap} className={cn(pos(className), "overflow-hidden bg-ink-3", className)} style={style}>
      {/* Poster through next/image so it is responsive, lazy and blurred-in */}
      {mode !== "controls" && (
        <Image
          src={video.poster}
          alt={video.alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder={video.blur ? "blur" : "empty"}
          blurDataURL={video.blur}
          className={objectFit}
          style={{ objectPosition: focal }}
        />
      )}
      {src && (
        <video
          ref={ref}
          src={src}
          poster={video.poster}
          muted={mode !== "controls"}
          loop={mode !== "controls"}
          playsInline
          controls={mode === "controls"}
          preload={priority ? "auto" : "metadata"}
          onPlaying={() => setPlaying(true)}
          aria-label={video.alt || undefined}
          aria-hidden={mode === "controls" ? undefined : true}
          className={cn(
            "absolute inset-0 h-full w-full transition-opacity duration-700",
            objectFit,
            mode === "controls" || playing ? "opacity-100" : "opacity-0",
          )}
          style={{ objectPosition: focal }}
        />
      )}
    </div>
  );
}

/** Respect an explicit absolute/fixed position from the caller; default to relative. */
const pos = (className?: string) => (/\b(absolute|fixed|sticky)\b/.test(className ?? "") ? "" : "relative");

/** Deterministic tone per key so empty plates feel varied, not templated. */
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const TONES = [
  ["#2a211b", "#0f0d0b", "#4a3426"],
  ["#1d2124", "#0c0d0e", "#33393d"],
  ["#2b1d1a", "#0e0b0a", "#5a2c22"],
  ["#22201a", "#0d0c0a", "#3f3a2c"],
  ["#1a1c20", "#0b0b0c", "#2e2c34"],
];

export function EmptyPlate({
  plate,
  className,
  style,
}: {
  plate: EmptyPlateT;
  className?: string;
  style?: CSSProperties;
}) {
  const h = hash(plate.key || "x");
  const [a, b, c] = TONES[h % TONES.length];
  const angle = (h % 140) + 110;
  return (
    <div
      role="img"
      aria-label={plate.alt || "Image coming soon"}
      className={cn(pos(className), "overflow-hidden", className)}
      style={{
        ...style,
        backgroundImage: `radial-gradient(120% 90% at ${20 + (h % 60)}% ${15 + (h % 50)}%, ${c} 0%, transparent 55%), linear-gradient(${angle}deg, ${a}, ${b} 70%)`,
      }}
    >
      {/* light leak */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          backgroundImage: `radial-gradient(60% 40% at ${80 - (h % 40)}% ${70 - (h % 30)}%, rgba(217,72,47,0.18), transparent 70%)`,
        }}
      />
      <div aria-hidden className="crop-marks absolute inset-3 opacity-25" />
      <div
        aria-hidden
        className="label absolute bottom-3 left-3 right-3 flex justify-between gap-2 text-[10px] text-bone/35"
      >
        <span className="truncate">{plate.key || "media"}</span>
        <span className="shrink-0">Awaiting media</span>
      </div>
    </div>
  );
}
