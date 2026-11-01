"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Clapperboard,
  Film,
  MessageCircle,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { booking, contact, enquiry } from "@/content/site";
import { media } from "@/lib/media";
import { validateEnquiry, type Enquiry } from "@/lib/enquiry-schema";
import { useExperience } from "@/components/providers/Experience";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;
const SHUTTER = [0.76, 0, 0.24, 1] as const;
const DELAY_MS = 10_000;
const SEEN_KEY = "btf-booking-seen";
const BOOKED_KEY = "btf-booked";

type Phase = "hidden" | "teaser" | "open" | "done";
type Draft = Pick<
  Enquiry,
  "eventType" | "coverage" | "date" | "dateFlexible" | "venue" | "guests" | "budget" | "name" | "phone" | "email"
>;

const blank: Draft = {
  eventType: "",
  coverage: "",
  date: "",
  dateFlexible: false,
  venue: "",
  guests: "100",
  budget: "",
  name: "",
  phone: "",
  email: "",
};

const STEPS = ["Occasion", "Date", "Coverage", "Details", "You"] as const;

const store = {
  get(k: string, s: "local" | "session") {
    try {
      return (s === "local" ? localStorage : sessionStorage).getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string, s: "local" | "session") {
    try {
      (s === "local" ? localStorage : sessionStorage).setItem(k, v);
    } catch {}
  },
};

/** Opens the booking popup from anywhere (e.g. "Book with us" buttons). */
export const OPEN_BOOKING = "booking:open";

export function BookingPopup() {
  const { ready, lockScroll } = useExperience();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("hidden");
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [d, setD] = useState<Draft>(blank);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setD((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  // ── Timed teaser: 10s after the intro, once per visit, never after booking ──
  useEffect(() => {
    if (!ready) return;
    if (store.get(BOOKED_KEY, "local") || store.get(SEEN_KEY, "session")) return;
    let id: ReturnType<typeof setTimeout>;
    const attempt = () => {
      const busy =
        document.documentElement.style.overflow === "hidden" || // menu / viewer / film open
        document.activeElement?.closest("#contact form") !== null; // already filling the form
      if (busy) {
        id = setTimeout(attempt, 4000);
        return;
      }
      store.set(SEEN_KEY, "1", "session");
      setPhase((p) => (p === "hidden" ? "teaser" : p));
    };
    id = setTimeout(attempt, DELAY_MS);
    return () => clearTimeout(id);
  }, [ready]);

  // ── "Book with us" buttons open the wizard directly ──
  useEffect(() => {
    const open = (eventType?: string) => {
      store.set(SEEN_KEY, "1", "session");
      if (eventType) setD((p) => ({ ...p, eventType }));
      setStep(eventType ? 1 : 0);
      setFailed(false);
      setPhase("open");
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-book]");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      e.stopPropagation();
      open(a.dataset.bookType || undefined);
    };
    const onEvent = (e: Event) => open((e as CustomEvent<{ eventType?: string }>).detail?.eventType);
    document.addEventListener("click", onClick, true);
    window.addEventListener(OPEN_BOOKING, onEvent);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(OPEN_BOOKING, onEvent);
    };
  }, []);

  const modal = phase === "open" || phase === "done";
  useEffect(() => {
    lockScroll(modal);
  }, [modal, lockScroll]);

  const close = useCallback(() => setPhase("hidden"), []);

  // ── Validation per step ──
  const stepError = useCallback(
    (s: number): Partial<Record<keyof Draft, string>> => {
      if (s === 0 && !d.eventType) return { eventType: "Pick one to continue." };
      if (s === 1 && !d.dateFlexible) {
        if (!d.date) return { date: "Choose a date, or tap “Not set yet”." };
        if (daysUntil(d.date) < 0) return { date: "That date has already passed." };
      }
      if (s === 2 && !d.coverage) return { coverage: "Pick one to continue." };
      if (s === 4) {
        const all = validateEnquiry({ ...d, message: "" });
        const out: Partial<Record<keyof Draft, string>> = {};
        if (all.name) out.name = all.name;
        if (all.phone) out.phone = all.phone;
        if (all.email) out.email = all.email;
        return out;
      }
      return {};
    },
    [d],
  );

  const go = useCallback(
    (to: number) => {
      if (to > step) {
        const err = stepError(step);
        if (Object.keys(err).length) {
          setErrors(err);
          return;
        }
      }
      setDir(to > step ? 1 : -1);
      setStep(to);
    },
    [step, stepError],
  );

  const submit = useCallback(async () => {
    const err = stepError(4);
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }
    setSending(true);
    setFailed(false);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...d, message: "Sent from the booking popup." }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error();
      store.set(BOOKED_KEY, "1", "local");
      setPhase("done");
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }, [d, stepError]);

  // Pick a choice and glide to the next frame.
  const choose = useCallback(
    <K extends "eventType" | "coverage">(k: K, v: string) => {
      setD((p) => ({ ...p, [k]: v }));
      setErrors({});
      setTimeout(() => {
        setDir(1);
        setStep((s) => s + 1);
      }, reduce ? 0 : 380);
    },
    [reduce],
  );

  // Focus the first field of each new frame (not on every keystroke).
  useEffect(() => {
    if (!modal) return;
    const t = setTimeout(() => {
      const first = panel.current?.querySelector<HTMLElement>("[data-autofocus]") ?? panel.current;
      first?.focus({ preventScroll: true });
    }, 120);
    return () => clearTimeout(t);
  }, [modal, step, phase]);

  // ── Keyboard: Esc closes, Enter continues, number keys pick, Tab stays inside ──
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "Escape") return close();
      if (phase !== "open") return;
      const typing = t.tagName === "INPUT" || t.tagName === "TEXTAREA";
      if (e.key === "Enter" && t.tagName !== "BUTTON" && t.tagName !== "A") {
        e.preventDefault();
        if (step < 4) go(step + 1);
        else submit();
      }
      if (!typing && /^[1-9]$/.test(e.key)) {
        const n = Number(e.key) - 1;
        if (step === 0 && enquiry.eventTypes[n]) choose("eventType", enquiry.eventTypes[n]);
        if (step === 2 && enquiry.coverage[n]) choose("coverage", enquiry.coverage[n]);
      }
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a, input, [tabindex]:not([tabindex='-1'])",
        );
        const a = f[0];
        const b = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          b.focus();
        } else if (!e.shiftKey && document.activeElement === b) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, phase, step, go, submit, choose, close]);

  const visual = useMemo(() => {
    if (phase === "done") return booking.visuals.done;
    const key = d.eventType ? booking.visuals.byType[d.eventType as keyof typeof booking.visuals.byType] : "";
    return key || booking.visuals.steps[step];
  }, [d.eventType, step, phase]);

  const waText = useMemo(() => whatsappText(d), [d]);

  return (
    <>
      {/* ── Teaser card ─────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "teaser" && (
          <motion.aside
            role="dialog"
            aria-label="Book with us"
            initial={{ opacity: 0, y: 60, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="fixed inset-x-3 bottom-20 z-[45] sm:bottom-6 sm:left-auto sm:right-6 sm:w-[380px]"
          >
            <div className="relative overflow-hidden rounded-2xl border border-line-strong bg-ink-2/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
              <button
                type="button"
                onClick={close}
                aria-label="Dismiss"
                className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-ink/60 text-bone/80 hover:text-bone"
              >
                <X className="size-4" />
              </button>
              <button type="button" onClick={() => setPhase("open")} className="group flex w-full text-left">
                <div className="relative w-28 shrink-0 overflow-hidden">
                  <TeaserReel />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5 pr-10">
                  <span className="label flex items-center gap-2 text-safelight">
                    <span className="size-1.5 rounded-full bg-safelight motion-safe:animate-[rec-pulse_1.2s_ease-in-out_infinite]" />
                    Now booking
                  </span>
                  <span className="display text-[1.7rem] leading-[1.02]">
                    Planning an <span className="italic">event?</span>
                  </span>
                  <span className="text-sm text-mute">Five quick taps and we&rsquo;ll take it from there.</span>
                  <span className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-bone px-4 py-2 text-sm font-medium text-ink transition-transform duration-500 ease-expo group-hover:translate-x-1">
                    Let&rsquo;s go <ArrowRight className="size-4" />
                  </span>
                </div>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Wizard ──────────────────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.2 } }}
          >
            <motion.div
              className="absolute inset-0 bg-ink/70 backdrop-blur-md"
              onClick={close}
              aria-hidden
            />
            <motion.div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-q"
              tabIndex={-1}
              data-lenis-prevent
              className="relative flex max-h-[94svh] w-full flex-col overflow-hidden rounded-t-3xl border border-line-strong bg-ink-2 shadow-2xl shadow-black/70 outline-none sm:max-h-[min(720px,92vh)] sm:max-w-5xl sm:flex-row sm:rounded-3xl"
              initial={{ clipPath: "inset(100% 0% 0% 0% round 24px)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0% round 24px)" }}
              exit={{ clipPath: "inset(100% 0% 0% 0% round 24px)" }}
              transition={{ duration: 0.9, ease: SHUTTER }}
            >
              {/* Visual panel */}
              <div className="relative h-36 shrink-0 overflow-hidden sm:h-auto sm:w-[42%]">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={visual}
                    className="absolute inset-0"
                    initial={{ clipPath: "inset(0% 0% 0% 100%)", scale: 1.15 }}
                    animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
                    exit={{ opacity: 0.4, transition: { duration: 0.9 } }}
                    transition={{ duration: 0.9, ease: SHUTTER }}
                  >
                    <MediaFrame media={media(visual, "", [4, 5])} sizes="(min-width: 640px) 420px, 100vw" focal="50% 30%" className="absolute inset-0" />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-ink-2/90 via-transparent to-ink/30 sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-ink-2/40" />
                <div className="label absolute left-4 top-4 flex items-center gap-2 text-bone/85">
                  <span className="size-1.5 rounded-full bg-safelight motion-safe:animate-[rec-pulse_1.2s_ease-in-out_infinite]" />
                  {phase === "done" ? "That's a wrap" : `Frame ${String(step + 1).padStart(2, "0")}`}
                </div>
                {d.eventType && phase !== "done" && (
                  <motion.span
                    key={d.eventType}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="display absolute bottom-4 left-4 hidden text-3xl italic sm:block"
                  >
                    {d.eventType}
                  </motion.span>
                )}
              </div>

              {/* Content */}
              <div className="relative flex min-h-0 flex-1 flex-col">
                <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-8 sm:pt-7">
                  {phase === "open" ? <FilmStrip step={step} onJump={(i) => i < step && go(i)} /> : <span />}
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close booking"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line-strong text-bone/80 hover:border-bone hover:text-bone"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4 pt-6 sm:px-8">
                  <AnimatePresence mode="wait" custom={dir} initial={false}>
                    <motion.div
                      key={phase === "done" ? "done" : step}
                      custom={dir}
                      initial={{ opacity: 0, x: reduce ? 0 : dir * 60 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: reduce ? 0 : dir * -60 }}
                      transition={{ duration: 0.45, ease: EASE }}
                    >
                      {phase === "done" ? (
                        <Done name={d.name} phone={d.phone} waText={waText} onClose={close} />
                      ) : (
                        <StepBody step={step} d={d} set={set} choose={choose} errors={errors} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {phase === "open" && (
                  <div className="border-t border-line px-5 py-4 sm:px-8">
                    {failed && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        role="alert"
                        className="mb-3 flex flex-col gap-3 rounded-xl border border-safelight/40 bg-safelight/10 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span>We couldn&rsquo;t send that online. Send it on WhatsApp instead, it&rsquo;s all filled in.</span>
                        <a
                          href={`${contact.whatsappHref}?text=${encodeURIComponent(waText)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-bone px-4 py-2 font-medium text-ink"
                        >
                          <MessageCircle className="size-4" /> Send on WhatsApp
                        </a>
                      </motion.div>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => go(step - 1)}
                        disabled={step === 0}
                        className="flex h-11 items-center gap-2 rounded-full px-3 text-sm text-mute transition-colors hover:text-bone disabled:invisible"
                      >
                        <ArrowLeft className="size-4" /> Back
                      </button>
                      <span className="label hidden text-mute md:inline">
                        {step === 0 || step === 2 ? "Press a number to pick" : "Press Enter ↵ to continue"}
                      </span>
                      {step < 4 ? (
                        <button
                          type="button"
                          onClick={() => go(step + 1)}
                          className="group flex h-12 items-center gap-2 rounded-full bg-bone pl-6 pr-2 text-sm font-medium text-ink"
                        >
                          Next
                          <span className="flex size-8 items-center justify-center rounded-full bg-ink text-bone transition-transform duration-500 ease-expo group-hover:translate-x-0.5">
                            <ArrowRight className="size-4" />
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={submit}
                          disabled={sending}
                          className="group relative flex h-12 items-center gap-2 overflow-hidden rounded-full bg-safelight pl-6 pr-2 text-sm font-medium text-bone disabled:opacity-70"
                        >
                          {sending ? "Sending…" : "Book with us"}
                          <span className="flex size-8 items-center justify-center rounded-full bg-bone text-ink">
                            {sending ? (
                              <span className="size-3 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                            ) : (
                              <Sparkles className="size-4" />
                            )}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Shutter flash + confetti on success */}
              <AnimatePresence>
                {phase === "done" && !reduce && (
                  <>
                    <motion.div
                      key="flash"
                      className="pointer-events-none absolute inset-0 z-20 bg-bone"
                      initial={{ opacity: 0.95 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                    <Confetti key="confetti" />
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ───────────────────────── Steps ───────────────────────── */

function StepBody({
  step,
  d,
  set,
  choose,
  errors,
}: {
  step: number;
  d: Draft;
  set: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  choose: (k: "eventType" | "coverage", v: string) => void;
  errors: Partial<Record<keyof Draft, string>>;
}) {
  if (step === 0)
    return (
      <Question kicker="Let's plan something unforgettable" title={<>What are we <em>celebrating?</em></>} error={errors.eventType}>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {enquiry.eventTypes.map((t, i) => {
            const key = booking.visuals.byType[t as keyof typeof booking.visuals.byType];
            const on = d.eventType === t;
            return (
              <motion.button
                key={t}
                type="button"
                data-autofocus={i === 0 ? true : undefined}
                onClick={() => choose("eventType", t)}
                whileHover={{ y: -4, rotate: i % 2 ? 1 : -1 }}
                whileTap={{ scale: 0.95 }}
                aria-pressed={on}
                className={cn(
                  "group relative aspect-[4/3] overflow-hidden rounded-xl border text-left transition-colors",
                  on ? "border-bone" : "border-line-strong hover:border-bone/60",
                )}
              >
                {key ? (
                  <MediaFrame media={media(key, "", [4, 3])} sizes="200px" focal="50% 30%" className="absolute inset-0 transition-transform duration-700 ease-expo group-hover:scale-110" />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_20%,#4a3426,transparent_60%),linear-gradient(160deg,#1b1916,#0b0a09)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                <span className="label absolute left-2.5 top-2.5 rounded-full bg-ink/60 px-2 py-0.5 text-[10px] text-bone/80 backdrop-blur">
                  {i + 1}
                </span>
                <span className="display absolute bottom-2.5 left-3 right-3 text-xl leading-tight sm:text-2xl">{t}</span>
                <AnimatePresence>
                  {on && (
                    <motion.span
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full bg-safelight"
                    >
                      <Check className="size-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </Question>
    );

  if (step === 1) {
    const days = d.date ? daysUntil(d.date) : null;
    return (
      <Question kicker="Save the date" title={<>When&rsquo;s the <em>big day?</em></>} error={errors.date}>
        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="sr-only">Event date</span>
            <input
              type="date"
              data-autofocus
              min={todayISO()}
              value={d.date}
              disabled={d.dateFlexible}
              onChange={(e) => set("date", e.target.value)}
              className="h-16 w-full rounded-xl border border-line-strong bg-ink px-5 text-xl text-bone outline-none [color-scheme:dark] focus:border-bone disabled:opacity-40"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              set("dateFlexible", !d.dateFlexible);
              if (!d.dateFlexible) set("date", "");
            }}
            aria-pressed={d.dateFlexible}
            className={cn(
              "w-fit rounded-full border px-5 py-2.5 text-sm transition-colors",
              d.dateFlexible ? "border-bone bg-bone text-ink" : "border-line-strong text-bone/80 hover:border-bone/60",
            )}
          >
            Not set yet
          </button>
          <AnimatePresence mode="wait">
            {(d.dateFlexible || (days !== null && days >= 0)) && (
              <motion.div
                key={d.dateFlexible ? "flex" : d.date}
                initial={{ opacity: 0, y: 14, rotate: -2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="rounded-2xl border border-line bg-ink p-5"
              >
                {d.dateFlexible ? (
                  <p className="display text-2xl">No problem. We&rsquo;ll plan around you.</p>
                ) : (
                  <>
                    <p className="label text-safelight">{weekday(d.date)}</p>
                    <p className="display mt-1 text-3xl">{prettyDate(d.date)}</p>
                    <p className="mt-2 text-sm text-mute">{dateReaction(days!, d.date)}</p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Question>
    );
  }

  if (step === 2) {
    const opts = [
      { v: "Photography", icon: Camera, line: "Every moment, framed." },
      { v: "Film", icon: Clapperboard, line: "Moving pictures, real sound." },
      { v: "Both", icon: Film, line: "The full story. Our favourite." },
    ];
    return (
      <Question kicker="Your story, your way" title={<>Photos, film or <em>the full story?</em></>} error={errors.coverage}>
        <div className="grid gap-3 sm:grid-cols-3">
          {opts.map((o, i) => {
            const on = d.coverage === o.v;
            const Icon = o.icon;
            return (
              <motion.button
                key={o.v}
                type="button"
                data-autofocus={i === 0 ? true : undefined}
                onClick={() => choose("coverage", o.v)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                aria-pressed={on}
                className={cn(
                  "relative flex items-center gap-4 rounded-2xl border p-5 text-left transition-colors sm:flex-col sm:items-start sm:gap-6",
                  on ? "border-bone bg-bone text-ink" : "border-line-strong hover:border-bone/60",
                )}
              >
                <span className="label absolute right-4 top-4 opacity-60">{i + 1}</span>
                <motion.span
                  animate={on ? { rotate: [0, -12, 12, 0], scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.6 }}
                  className={cn("flex size-12 items-center justify-center rounded-full", on ? "bg-ink text-bone" : "bg-ink-3")}
                >
                  <Icon className="size-5" />
                </motion.span>
                <span>
                  <span className="display block text-3xl">{o.v}</span>
                  <span className={cn("text-sm", on ? "text-ink/70" : "text-mute")}>{o.line}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </Question>
    );
  }

  if (step === 3) {
    const g = Number(d.guests || 100);
    return (
      <Question kicker="Set the scene" title={<>Paint us <em>the picture.</em></>}>
        <div className="flex flex-col gap-7">
          <label className="block">
            <span className="label text-mute">Where is it happening?</span>
            <input
              data-autofocus
              value={d.venue}
              onChange={(e) => set("venue", e.target.value)}
              placeholder="Venue, town or city"
              autoComplete="address-level2"
              className="mt-2 h-14 w-full rounded-xl border border-line-strong bg-ink px-5 text-lg text-bone outline-none placeholder:text-dim focus:border-bone"
            />
          </label>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="label text-mute">How many guests?</span>
              <motion.span key={guestLabel(g)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-safelight">
                {guestLabel(g)}
              </motion.span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="display text-5xl" style={{ fontVariantNumeric: "tabular-nums" }}>
                {g >= 800 ? "800+" : g}
              </span>
              <span className="text-mute">guests</span>
            </div>
            <GuestDots count={g} />
            <input
              type="range"
              min={10}
              max={800}
              step={10}
              value={g}
              onChange={(e) => set("guests", e.target.value)}
              aria-label="Number of guests"
              className="mt-3 w-full accent-[var(--color-safelight)]"
            />
          </div>
          <div>
            <span className="label text-mute">Rough budget (optional)</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {enquiry.budgets.map((b) => (
                <motion.button
                  key={b}
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => set("budget", d.budget === b ? "" : b)}
                  aria-pressed={d.budget === b}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors",
                    d.budget === b ? "border-bone bg-bone text-ink" : "border-line-strong text-bone/80 hover:border-bone/60",
                  )}
                >
                  {b}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </Question>
    );
  }

  return (
    <Question kicker="Last frame" title={<>Who should we <em>call?</em></>}>
      <div className="flex flex-col gap-4">
        <BigInput label="Your name" value={d.name} onChange={(v) => set("name", v)} error={errors.name} autoComplete="name" autoFocus />
        <BigInput
          label="Phone / WhatsApp"
          type="tel"
          value={d.phone}
          onChange={(v) => set("phone", v)}
          error={errors.phone}
          autoComplete="tel"
          icon={<Phone className="size-4" />}
          placeholder="07xx xxx xxx"
        />
        <BigInput label="Email (optional)" type="email" value={d.email} onChange={(v) => set("email", v)} error={errors.email} autoComplete="email" />
        <p className="text-sm text-mute">We&rsquo;ll call or WhatsApp you personally. No spam, ever.</p>
      </div>
    </Question>
  );
}

function Question({
  kicker,
  title,
  error,
  children,
}: {
  kicker: string;
  title: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="label text-mute">{kicker}</p>
      <h2 id="booking-q" className="display mt-2 text-[clamp(2.1rem,4.4vw,3.4rem)] leading-[0.95] [&_em]:italic">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
      <AnimatePresence>
        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-4 text-sm text-safelight"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function BigInput({
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  autoFocus,
  icon,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  icon?: ReactNode;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="label text-mute">{label}</span>
      <span className="relative mt-2 block">
        {icon && <span className="absolute left-5 top-1/2 -translate-y-1/2 text-safelight">{icon}</span>}
        <input
          type={type}
          value={value}
          data-autofocus={autoFocus ? true : undefined}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            "h-14 w-full rounded-xl border bg-ink px-5 text-lg text-bone outline-none placeholder:text-dim focus:border-bone",
            icon ? "pl-12" : "",
            error ? "border-safelight" : "border-line-strong",
          )}
        />
      </span>
      {error && <span className="mt-1.5 block text-sm text-safelight">{error}</span>}
    </label>
  );
}

/* ───────────────────────── Pieces ───────────────────────── */

function FilmStrip({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <ol className="flex items-center gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
      {STEPS.map((s, i) => (
        <li key={s}>
          <button
            type="button"
            onClick={() => onJump(i)}
            disabled={i >= step}
            aria-label={`${s}${i < step ? " (done, go back)" : ""}`}
            className="group flex flex-col items-center gap-1 disabled:cursor-default"
          >
            <span
              className={cn(
                "relative block h-6 w-9 overflow-hidden rounded-[3px] border transition-colors duration-500 sm:w-11",
                i < step ? "border-bone bg-bone" : i === step ? "border-safelight bg-safelight/20" : "border-line-strong",
              )}
            >
              {/* sprocket holes */}
              <span className="absolute inset-x-1 top-0.5 flex justify-between">
                {[0, 1, 2].map((k) => (
                  <span key={k} className={cn("block size-[3px] rounded-[1px]", i < step ? "bg-ink/50" : "bg-bone/25")} />
                ))}
              </span>
              <span className="absolute inset-x-1 bottom-0.5 flex justify-between">
                {[0, 1, 2].map((k) => (
                  <span key={k} className={cn("block size-[3px] rounded-[1px]", i < step ? "bg-ink/50" : "bg-bone/25")} />
                ))}
              </span>
              {i < step && <Check className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 text-ink" />}
              {i === step && (
                <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-safelight motion-safe:animate-[rec-pulse_1s_ease-in-out_infinite]" />
              )}
            </span>
            <span className={cn("label hidden text-[9px] sm:block", i === step ? "text-bone" : "text-dim")}>{s}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}

function GuestDots({ count }: { count: number }) {
  const total = 40;
  const lit = Math.max(1, Math.round((Math.min(count, 800) / 800) * total));
  return (
    <div className="mt-3 flex flex-wrap gap-1.5" aria-hidden>
      {Array.from({ length: total }).map((_, i) => (
        <motion.span
          key={i}
          className="block size-2.5 rounded-full"
          animate={{
            backgroundColor: i < lit ? "rgb(237 231 221)" : "rgb(237 231 221 / 0.12)",
            scale: i === lit - 1 ? [1, 1.6, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
}

function TeaserReel() {
  const keys = booking.visuals.teaser;
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % keys.length), 2200);
    return () => clearInterval(id);
  }, [keys.length]);
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={i}
        className="absolute inset-0"
        initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
        exit={{ opacity: 0.5, transition: { duration: 0.8 } }}
        transition={{ duration: 0.8, ease: SHUTTER }}
      >
        <MediaFrame media={media(keys[i], "", [4, 5])} sizes="112px" focal="50% 30%" className="absolute inset-0" />
      </motion.div>
    </AnimatePresence>
  );
}

function Done({ name, phone, waText, onClose }: { name: string; phone: string; waText: string; onClose: () => void }) {
  return (
    <div className="py-4">
      <motion.span
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 }}
        className="flex size-16 items-center justify-center rounded-full bg-safelight"
      >
        <Check className="size-8" />
      </motion.span>
      <p className="label mt-6 text-mute">Booking received</p>
      <h2 id="booking-q" className="display mt-2 text-[clamp(2.4rem,5vw,4rem)] leading-[0.95]">
        That&rsquo;s a wrap, <em className="italic">{name.split(" ")[0] || "friend"}!</em>
      </h2>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-mute">
        We&rsquo;ll call or WhatsApp you on <span className="text-bone">{phone}</span> very soon to talk through the
        details.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={`${contact.whatsappHref}?text=${encodeURIComponent(waText)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-bone px-6 text-sm font-medium text-ink"
        >
          <MessageCircle className="size-4" /> Can&rsquo;t wait? WhatsApp us
        </a>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 text-sm hover:border-bone"
        >
          Keep exploring
        </button>
      </div>
    </div>
  );
}

/** Film-frame confetti: tiny palette-coloured frames burst from the centre. */
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 46 }).map((_, i) => {
        const angle = (i / 46) * Math.PI * 2 + (i % 3) * 0.2;
        const dist = 160 + ((i * 53) % 220);
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist * 0.7,
          r: ((i * 97) % 540) - 270,
          c: ["#d9482f", "#ede7dd", "#8f897f", "#c98b4f", "#ede7dd"][i % 5],
          w: 6 + (i % 4) * 3,
          d: (i % 7) * 0.025,
        };
      }),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 block rounded-[2px]"
          style={{ width: p.w, height: p.w * 1.4, backgroundColor: p.c }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 320], opacity: [1, 1, 0], rotate: p.r, scale: 1 }}
          transition={{ duration: 1.9, delay: 0.15 + p.d, ease: [0.2, 0.8, 0.4, 1] }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── Helpers ───────────────────────── */

function todayISO() {
  const n = new Date();
  return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function daysUntil(iso: string) {
  const t = new Date(`${iso}T12:00:00`).getTime();
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.round((t - now.getTime()) / 86_400_000);
}
function weekday(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long" });
}
function prettyDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
function dateReaction(days: number, iso: string) {
  const wd = new Date(`${iso}T12:00:00`).getDay();
  const weekend = wd === 0 || wd === 6 ? " A weekend celebration, love it." : "";
  if (days === 0) return "That's today! Call us right away and we'll see what we can do.";
  if (days < 14) return `That's just ${days} day${days === 1 ? "" : "s"} away. Let's move fast.${weekend}`;
  if (days < 60) return `That's ${days} days away. Perfect timing to plan it properly.${weekend}`;
  return `That's ${days} days away. Booking early means the best light and the best plan.${weekend}`;
}
function guestLabel(g: number) {
  if (g < 50) return "Intimate & personal";
  if (g < 150) return "A proper party";
  if (g < 400) return "A big celebration";
  if (g < 800) return "Half the town is coming";
  return "The whole village";
}
function whatsappText(d: Draft) {
  const lines = [
    "Hi Beyond the Frame! I'd like to book:",
    `• Event: ${d.eventType || "-"}`,
    `• Date: ${d.dateFlexible ? "Not set yet" : d.date ? prettyDate(d.date) : "-"}`,
    `• Coverage: ${d.coverage || "-"}`,
    `• Venue: ${d.venue || "-"}`,
    `• Guests: ${d.guests || "-"}`,
    `• Budget: ${d.budget || "-"}`,
    `• Name: ${d.name || "-"}`,
    `• Phone: ${d.phone || "-"}`,
  ];
  if (d.email) lines.push(`• Email: ${d.email}`);
  return lines.join("\n");
}
