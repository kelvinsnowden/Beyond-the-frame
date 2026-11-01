"use client";

import { useEffect, useRef } from "react";

/** A running SMPTE-style timecode — a small "camera is rolling" detail. */
export function Timecode({ fps = 24, className }: { fps?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let last = -1;
    const pad = (n: number) => String(n).padStart(2, "0");
    const tick = (now: number) => {
      const total = Math.floor(((now - start) / 1000) * fps);
      if (total !== last && ref.current) {
        last = total;
        const f = total % fps;
        const s = Math.floor(total / fps);
        ref.current.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fps]);
  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      00:00:00:00
    </span>
  );
}

/** Live local time for the studio's timezone. */
export function LocalTime({ timeZone, className }: { timeZone: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone });
    const set = () => {
      if (ref.current) ref.current.textContent = fmt.format(new Date());
    };
    set();
    const id = setInterval(set, 15000);
    return () => clearInterval(id);
  }, [timeZone]);
  return <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }} />;
}
