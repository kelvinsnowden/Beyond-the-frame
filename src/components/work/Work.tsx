"use client";

import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { projects, type Category } from "@/content/site";
import { MaskText, SectionLabel } from "@/components/ui/Reveal";
import { ProjectCard } from "./ProjectCard";
import { ProjectViewer } from "./ProjectViewer";
import { cn } from "@/lib/cn";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function Work() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [desktop, setDesktop] = useState(false);
  const [distance, setDistance] = useState(0);
  const [filter, setFilter] = useState<Category | "All">("All");
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  // Horizontally off-screen cards never trigger native lazy-load, so fetch them when the section is near.
  const near = useInView(section, { margin: "0px 0px 120% 0px", once: true });

  // Only categories that actually have work appear as filters.
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(projects.map((p) => p.category)))] as (Category | "All")[],
    [],
  );
  const list = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const set = () => setDesktop(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  // Measure how far the strip must travel horizontally.
  useIsoLayoutEffect(() => {
    const el = track.current;
    if (!el || !desktop) return;
    // offsetWidth = layout width; scrollWidth would include in-flight layout-animation transforms.
    const measure = () => setDistance(Math.max(0, el.offsetWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [desktop, list.length]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (v) => -v * distance);

  // Mobile progress follows the native horizontal scroller.
  const mobileProgress = useMotionValue(0);
  const progress = desktop ? scrollYProgress : mobileProgress;

  // Deep links: #work/<slug>
  useEffect(() => {
    const fromHash = () => {
      const m = window.location.hash.match(/^#work\/(.+)$/);
      setOpenSlug(m && projects.some((p) => p.slug === m[1]) ? m[1] : null);
    };
    fromHash();
    window.addEventListener("popstate", fromHash);
    return () => window.removeEventListener("popstate", fromHash);
  }, []);

  const open = useCallback((slug: string, el?: HTMLElement) => {
    returnFocus.current = el ?? null;
    history.pushState(null, "", `#work/${slug}`);
    setOpenSlug(slug);
  }, []);

  const close = useCallback(() => {
    if (window.location.hash.startsWith("#work/")) history.replaceState(null, "", "#work");
    setOpenSlug(null);
    requestAnimationFrame(() => returnFocus.current?.focus({ preventScroll: true }));
  }, []);

  const go = useCallback((slug: string) => {
    history.replaceState(null, "", `#work/${slug}`);
    setOpenSlug(slug);
  }, []);

  return (
    <section
      id="work"
      ref={section}
      aria-labelledby="work-title"
      className="relative"
      style={desktop ? { height: `calc(100vh + ${distance}px)` } : undefined}
    >
      <div className={cn(desktop ? "sticky top-0 flex h-screen flex-col overflow-hidden" : "py-24")}>
        {/* Header row */}
        <div className={cn("gutter flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between", desktop ? "pt-28" : "")}>
          <div>
            <SectionLabel index="02">Selected work</SectionLabel>
            <h2 id="work-title" className="display mt-6 text-[clamp(3rem,8vw,7.5rem)]">
              <MaskText>Moments, held</MaskText> <MaskText delay={0.12} className="italic">still.</MaskText>
            </h2>
          </div>

          <div
            role="group"
            aria-label="Filter projects by event type"
            className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:justify-end lg:px-0"
          >
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={filter === c}
                onClick={() => {
                  setFilter(c);
                  track.current?.scrollTo({ left: 0, behavior: "smooth" });
                }}
                className={cn(
                  "relative h-9 shrink-0 rounded-full border px-4 text-sm transition-colors duration-300",
                  filter === c ? "border-bone text-ink" : "border-line-strong text-mute hover:text-bone",
                )}
              >
                {filter === c && (
                  <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-bone" />
                )}
                <span className="relative">{c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Strip */}
        <motion.ul
          ref={track}
          style={desktop ? { x } : undefined}
          onScroll={(e) => {
            const el = e.currentTarget;
            mobileProgress.set(el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth));
          }}
          className={cn(
            "flex gap-4 md:gap-6",
            desktop
              ? "my-auto h-[var(--th)] w-max shrink-0 items-stretch gap-[3vw] pl-[clamp(1rem,3.2vw,3rem)] pr-[8vw] [--th:calc(100svh-22rem)]"
              : "no-scrollbar mt-12 snap-x snap-mandatory overflow-x-auto scroll-pl-4 px-4 pb-2 md:px-8",
          )}
          aria-label="Projects"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((p, i) => (
              <ProjectCard key={p.slug} project={p} index={i} desktop={desktop} eager={near} onOpen={(el) => open(p.slug, el)} />
            ))}
            <motion.li
              key="cta"
              layout
              className={cn("flex shrink-0 snap-start", desktop ? "w-[34vw] self-center" : "w-[72vw]")}
            >
              <a
                href="#contact"
                data-book
                className="group flex w-full flex-col justify-between border border-line p-6 transition-colors duration-500 hover:border-bone/50 md:p-8"
                style={{ minHeight: desktop ? "calc(var(--th) * 0.72)" : "60vw" }}
              >
                <span className="label text-mute">Next in the edit</span>
                <span className="display text-[clamp(2.2rem,3.6vw,3.6rem)] leading-[0.95]">
                  Your event
                  <br />
                  <span className="italic">could be next.</span>
                </span>
                <span className="flex items-center justify-between text-sm">
                  Book with us
                  <span className="flex size-12 items-center justify-center rounded-full bg-bone text-ink transition-transform duration-500 ease-expo group-hover:rotate-45 group-hover:scale-110">
                    <ArrowUpRight className="size-5" />
                  </span>
                </span>
              </a>
            </motion.li>
          </AnimatePresence>
        </motion.ul>

        {/* Progress */}
        <div className="gutter mt-8 flex items-center gap-4 pb-8 lg:mt-0">
          <span className="label text-mute" style={{ fontVariantNumeric: "tabular-nums" }}>
            {String(list.length).padStart(2, "0")} projects
          </span>
          <div className="relative h-px flex-1 bg-line">
            <motion.div className="absolute inset-0 origin-left bg-bone" style={{ scaleX: progress }} />
          </div>
          <span className="label hidden text-mute lg:inline">Scroll</span>
          <span className="label text-mute lg:hidden">Swipe</span>
        </div>
      </div>

      <ProjectViewer slug={openSlug} onClose={close} onNavigate={go} />
    </section>
  );
}
