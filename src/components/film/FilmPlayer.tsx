"use client";

import { AnimatePresence, motion } from "motion/react";
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoAsset } from "@/lib/media";
import { useExperience } from "@/components/providers/Experience";
import { cn } from "@/lib/cn";

const fmt = (t: number) => {
  if (!Number.isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

/**
 * Full-screen film player with custom, keyboard-accessible controls.
 * Space/K play · ←/→ seek 5s · M mute · F fullscreen · Esc close
 */
export function FilmPlayer({
  film,
  title,
  open,
  onClose,
}: {
  film: VideoAsset;
  title: string;
  open: boolean;
  onClose: () => void;
}) {
  const { lockScroll } = useExperience();
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [idle, setIdle] = useState(false);
  const [full, setFull] = useState(false);
  const [hoverT, setHoverT] = useState<{ x: number; t: number } | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poke = useCallback(() => {
    setIdle(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 2600);
  }, []);

  const toggle = useCallback(() => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const toggleFull = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else wrap.current?.requestFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      const v = video.current;
      if (!v) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) return;
      if (e.key === "Escape" && !document.fullscreenElement) onClose();
      else if (e.key === " " || e.key === "k") {
        if (target.tagName === "BUTTON") return;
        e.preventDefault();
        toggle();
      } else if (e.key === "ArrowRight") v.currentTime = Math.min(v.duration, v.currentTime + 5);
      else if (e.key === "ArrowLeft") v.currentTime = Math.max(0, v.currentTime - 5);
      else if (e.key === "m") setMuted((m) => !m);
      else if (e.key === "f") toggleFull();
      poke();
    };
    const onFs = () => setFull(Boolean(document.fullscreenElement));
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFs);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [open, onClose, lockScroll, toggle, toggleFull, poke]);

  useEffect(() => {
    if (video.current) video.current.muted = muted;
  }, [muted]);

  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={wrap}
          role="dialog"
          aria-modal="true"
          aria-label={`${title}, film`}
          className={cn("fixed inset-0 z-[70] bg-black", idle && playing && "cursor-none")}
          initial={{ clipPath: "inset(50% 0% 50% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(50% 0% 50% 0%)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          onPointerMove={poke}
          data-lenis-prevent
        >
          <video
            ref={video}
            src={film.src}
            poster={film.poster}
            autoPlay
            playsInline
            preload="auto"
            onClick={toggle}
            onPlay={() => {
              setPlaying(true);
              poke();
            }}
            onPause={() => {
              setPlaying(false);
              setIdle(false);
            }}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onProgress={(e) => {
              const v = e.currentTarget;
              if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
            }}
            className="absolute inset-0 h-full w-full object-contain"
          />

          {/* Big play state */}
          <AnimatePresence>
            {!playing && (
              <motion.button
                type="button"
                onClick={toggle}
                aria-label="Play film"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="absolute left-1/2 top-1/2 flex size-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-bone text-ink md:size-32"
              >
                <Play className="ml-1 size-8 fill-current" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Top bar */}
          <div
            className={cn(
              "gutter absolute inset-x-0 top-0 flex h-20 items-center justify-between bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-500",
              idle && playing ? "opacity-0" : "opacity-100",
            )}
          >
            <p className="display text-2xl md:text-3xl">
              {title}
              <span className="label ml-3 text-mute">Film</span>
            </p>
            <button
              ref={closeBtn}
              type="button"
              onClick={onClose}
              className="flex h-10 items-center gap-2 rounded-full bg-bone px-4 text-sm font-medium text-ink"
            >
              Close <X className="size-4" />
            </button>
          </div>

          {/* Controls */}
          <div
            className={cn(
              "gutter absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent pb-6 pt-16 transition-opacity duration-500",
              idle && playing ? "opacity-0" : "opacity-100",
            )}
          >
            <div
              className="group relative h-6"
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                const x = Math.min(Math.max(0, e.clientX - r.left), r.width);
                setHoverT({ x, t: (x / r.width) * duration });
              }}
              onPointerLeave={() => setHoverT(null)}
            >
              <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-bone/20 transition-[height] group-hover:h-[5px]">
                <div className="absolute inset-y-0 left-0 bg-bone/30" style={{ width: `${duration ? (buffered / duration) * 100 : 0}%` }} />
                <div className="absolute inset-y-0 left-0 bg-safelight" style={{ width: `${pct}%` }} />
              </div>
              <div
                className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bone opacity-0 transition-opacity group-hover:opacity-100"
                style={{ left: `${pct}%` }}
              />
              {hoverT && (
                <span
                  className="label pointer-events-none absolute -top-7 -translate-x-1/2 rounded bg-bone px-2 py-1 text-[10px] text-ink"
                  style={{ left: hoverT.x }}
                >
                  {fmt(hoverT.t)}
                </span>
              )}
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={time}
                aria-label="Seek"
                aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
                onChange={(e) => {
                  const v = video.current;
                  if (v) v.currentTime = Number(e.target.value);
                  setTime(Number(e.target.value));
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? "Pause" : "Play"}
                className="flex size-11 items-center justify-center rounded-full hover:bg-bone/10"
              >
                {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
              </button>
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? "Unmute" : "Mute"}
                className="flex size-11 items-center justify-center rounded-full hover:bg-bone/10"
              >
                {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </button>
              <span className="label ml-2 text-bone/80" style={{ fontVariantNumeric: "tabular-nums" }}>
                {fmt(time)} / {fmt(duration)}
              </span>
              <span className="label ml-auto hidden text-mute md:inline">Space · ← → · M · F</span>
              <button
                type="button"
                onClick={toggleFull}
                aria-label={full ? "Exit full screen" : "Full screen"}
                className="flex size-11 items-center justify-center rounded-full hover:bg-bone/10"
              >
                {full ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
