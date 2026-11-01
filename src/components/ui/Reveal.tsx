"use client";

import { motion, useInView, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Line / word mask reveal: each word slides up from behind a clipping mask.
 * Text remains real, selectable and readable by assistive tech.
 */
export function MaskText({
  children,
  as: Tag = "span",
  className,
  delay = 0,
  stagger = 0.06,
  play,
  once = true,
}: {
  children: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Drive manually; otherwise plays when scrolled into view. */
  play?: boolean;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount: 0.4 });
  const show = play ?? inView;
  const words = children.split(" ");

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{children}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
            <motion.span
              className="inline-block will-change-transform"
              initial={{ y: "110%" }}
              animate={show ? { y: "0%" } : { y: "110%" }}
              transition={{ duration: 1.1, ease: EASE, delay: delay + i * stagger }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  );
}

/** Fade-up on enter, for paragraphs and UI groups. */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "p" | "li" | "span";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const C = motion[as] as typeof motion.div;
  return (
    <C
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </C>
  );
}

/** Words light up one by one as the paragraph scrolls through the viewport. */
export function ScrubText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
            {w}
          </Word>
        ))}
      </span>
    </p>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {children}{" "}
    </motion.span>
  );
}

/** Image reveal: a curtain wipes away while the image settles from a scale. */
export function ClipReveal({
  children,
  className,
  delay = 0,
  from = "bottom",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: "bottom" | "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const hidden = {
    bottom: "inset(100% 0% 0% 0%)",
    left: "inset(0% 100% 0% 0%)",
    right: "inset(0% 0% 0% 100%)",
  }[from];
  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div
        className="h-full w-full"
        initial={{ clipPath: hidden, scale: 1.18 }}
        animate={inView ? { clipPath: "inset(0% 0% 0% 0%)", scale: 1 } : undefined}
        transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1], delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Section index label, e.g. (02): Selected work */
export function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div className="label flex items-center gap-3 text-mute">
      <span className="text-bone">({index})</span>
      <span className="h-px w-8 bg-line-strong" />
      <span>{children}</span>
    </div>
  );
}
