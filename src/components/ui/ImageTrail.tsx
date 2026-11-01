"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import { media, type ImageAsset } from "@/lib/media";

type Spawn = { id: number; x: number; y: number; img: ImageAsset; rot: number };

/**
 * Moving the pointer across the band "develops" a trail of photographs that
 * fade as they fall behind. Mouse only; decorative (hidden from AT).
 */
export function ImageTrail({
  keys,
  children,
  className,
  spacing = 110,
}: {
  keys: string[];
  children: ReactNode;
  className?: string;
  spacing?: number;
}) {
  const reduce = useReducedMotion();
  const images = keys.map((k) => media(k)).filter((m): m is ImageAsset => m.kind === "image");
  const [spawns, setSpawns] = useState<Spawn[]>([]);
  const last = useRef<{ x: number; y: number } | null>(null);
  const counter = useRef(0);

  return (
    <div
      className={className}
      data-cursor="Move"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || reduce || images.length === 0) return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const l = last.current;
        if (l && Math.hypot(x - l.x, y - l.y) < spacing) return;
        last.current = { x, y };
        const id = counter.current++;
        const img = images[id % images.length];
        const rot = ((id * 37) % 14) - 7;
        setSpawns((s) => [...s.slice(-6), { id, x, y, img, rot }]);
        setTimeout(() => setSpawns((s) => s.filter((p) => p.id !== id)), 1100);
      }}
      onPointerLeave={() => (last.current = null)}
    >
      <div className="relative">
        {children}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-visible">
          <AnimatePresence>
            {spawns.map((p) => {
              const w = 200;
              const h = Math.round((w * p.img.height) / p.img.width);
              return (
                <motion.div
                  key={p.id}
                  className="absolute overflow-hidden shadow-2xl shadow-black/50"
                  style={{ left: p.x - w / 2, top: p.y - h / 2, width: w, height: h }}
                  initial={{ opacity: 0, scale: 0.6, rotate: p.rot - 6, clipPath: "inset(50% 50% 50% 50%)" }}
                  animate={{ opacity: 1, scale: 1, rotate: p.rot, clipPath: "inset(0% 0% 0% 0%)" }}
                  exit={{ opacity: 0, scale: 0.9, y: 30, filter: "blur(6px)" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image src={p.img.src} alt="" fill sizes="200px" className="object-cover" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      {/* Warm the cache so the first trail frames appear instantly. */}
      <div aria-hidden className="pointer-events-none fixed -left-[9999px] size-px overflow-hidden">
        {images.map((m) => (
          <Image key={m.key} src={m.src} alt="" width={200} height={250} sizes="200px" loading="eager" />
        ))}
      </div>
    </div>
  );
}
