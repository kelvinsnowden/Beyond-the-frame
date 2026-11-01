"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { contact, enquiry } from "@/content/site";
import { PREFILL_EVENT, type PrefillDetail } from "@/lib/enquiry-events";
import { validateEnquiry, type Enquiry, type EnquiryErrors } from "@/lib/enquiry-schema";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

const empty: Enquiry = {
  eventType: "",
  coverage: "",
  date: "",
  dateFlexible: false,
  venue: "",
  guests: "",
  budget: "",
  name: "",
  email: "",
  phone: "",
  message: "",
  website: "",
};

type Status = "idle" | "sending" | "sent" | "error";

export function EnquiryForm() {
  const [data, setData] = useState<Enquiry>(empty);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof Enquiry>(k: K, v: Enquiry[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  // Any CTA on the page can pre-select the event type.
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const d = (e as CustomEvent<PrefillDetail>).detail;
      setData((cur) => ({
        ...cur,
        eventType: d.eventType ?? cur.eventType,
        coverage: d.coverage ?? cur.coverage,
      }));
    };
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, []);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const errs = validateEnquiry(data);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
      return;
    }
    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        throw new Error(json.error || "Something went wrong.");
      }
      setStatus("sent");
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div
            key="sent"
            role="status"
            initial={{ opacity: 0, clipPath: "circle(0% at 50% 50%)" }}
            animate={{ opacity: 1, clipPath: "circle(100% at 50% 50%)" }}
            transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
            className="flex min-h-[520px] flex-col items-start justify-center gap-6 bg-ink-3 p-8 md:p-12"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-safelight">
              <Check className="size-6" />
            </span>
            <h3 className="display text-5xl md:text-6xl">
              Received<span className="text-safelight">.</span>
            </h3>
            <p className="max-w-md text-lg leading-relaxed text-mute">
              Thank you, {data.name.split(" ")[0]}. We&rsquo;ll check availability
              {data.dateFlexible || !data.date ? "" : ` for ${formatDate(data.date)}`} and call or WhatsApp
              you on <span className="text-bone">{data.phone}</span> personally.
            </p>
            <button
              type="button"
              onClick={() => {
                setData(empty);
                setStatus("idle");
              }}
              className="label mt-4 border-b border-line-strong pb-1 text-mute hover:text-bone"
            >
              Send another enquiry
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            onSubmit={submit}
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="space-y-12"
            aria-describedby="form-note"
          >
            <Fieldset legend="The event" index="01">
              <ChipGroup
                label="Type of event"
                name="eventType"
                options={enquiry.eventTypes}
                value={data.eventType}
                onChange={(v) => set("eventType", v)}
                error={errors.eventType}
                required
              />
              <ChipGroup
                label="Coverage"
                name="coverage"
                options={enquiry.coverage}
                value={data.coverage}
                onChange={(v) => set("coverage", v)}
              />
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <Field
                    label="Event date"
                    name="date"
                    type="date"
                    value={data.date}
                    onChange={(v) => set("date", v)}
                    error={errors.date}
                    disabled={data.dateFlexible}
                    required={!data.dateFlexible}
                  />
                  <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-mute">
                    <input
                      type="checkbox"
                      checked={data.dateFlexible}
                      onChange={(e) => {
                        set("dateFlexible", e.target.checked);
                        if (e.target.checked) setErrors((er) => ({ ...er, date: undefined }));
                      }}
                      className="size-4 accent-[var(--color-safelight)]"
                    />
                    Date not set yet
                  </label>
                </div>
                <Field label="Venue or city" name="venue" value={data.venue} onChange={(v) => set("venue", v)} autoComplete="address-level2" />
              </div>
              <div className="grid gap-8 sm:grid-cols-[1fr_2fr]">
                <Field
                  label="Guests (approx.)"
                  name="guests"
                  inputMode="numeric"
                  value={data.guests}
                  onChange={(v) => set("guests", v.replace(/[^\d\s\-–+]/g, ""))}
                />
                <ChipGroup
                  label="Budget"
                  name="budget"
                  options={enquiry.budgets}
                  value={data.budget}
                  onChange={(v) => set("budget", v)}
                  compact
                />
              </div>
            </Fieldset>

            <Fieldset legend="About you" index="02">
              <div className="grid gap-8 sm:grid-cols-2">
                <Field label="Your name" name="name" value={data.name} onChange={(v) => set("name", v)} error={errors.name} autoComplete="name" required />
                <Field label="Phone / WhatsApp" name="phone" type="tel" value={data.phone} onChange={(v) => set("phone", v)} error={errors.phone} autoComplete="tel" required />
              </div>
              <Field label="Email (optional)" name="email" type="email" value={data.email} onChange={(v) => set("email", v)} error={errors.email} autoComplete="email" />
              <Field
                label="Tell us about the day"
                name="message"
                value={data.message}
                onChange={(v) => set("message", v)}
                error={errors.message}
                textarea
              />
            </Fieldset>

            {/* Honeypot */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Website
                <input tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => set("website", e.target.value)} />
              </label>
            </div>

            <div className="flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p id="form-note" className="max-w-xs text-sm text-mute">
                {contact.responseNote} Your details are only used to reply to this enquiry.
              </p>
              <button
                type="submit"
                disabled={status === "sending"}
                className="group relative flex h-16 items-center justify-between gap-6 overflow-hidden rounded-full bg-bone pl-8 pr-2 text-ink disabled:opacity-70 sm:min-w-[300px]"
              >
                <span className="relative z-10 text-base font-medium">
                  {status === "sending" ? "Sending…" : "Book with us"}
                </span>
                <span className="relative z-10 flex size-12 items-center justify-center rounded-full bg-ink text-bone transition-transform duration-500 ease-expo group-hover:rotate-45">
                  {status === "sending" ? <Loader2 className="size-5 animate-spin" /> : <ArrowUpRight className="size-5" />}
                </span>
                <span className="absolute inset-0 origin-left scale-x-0 bg-safelight transition-transform duration-700 ease-expo group-hover:scale-x-100" />
              </button>
            </div>

            <AnimatePresence>
              {status === "error" && (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="border-l-2 border-safelight pl-4 text-sm"
                >
                  {serverError} You can also call or WhatsApp us on{" "}
                  <a className="underline" href={contact.phoneHref}>
                    {contact.phone}
                  </a>
                  .
                </motion.p>
              )}
            </AnimatePresence>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function Fieldset({ legend, index, children }: { legend: string; index: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-8">
      <legend className="label mb-8 flex items-center gap-3 text-mute">
        <span className="text-bone">({index})</span>
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  textarea,
  required,
  disabled,
  autoComplete,
  inputMode,
}: {
  label: string;
  name: keyof Enquiry;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  textarea?: boolean;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  inputMode?: "numeric" | "text";
}) {
  const id = useId();
  const errId = `${id}-err`;
  const filled = value.length > 0 || type === "date";
  const common = {
    id,
    name,
    value,
    required,
    disabled,
    autoComplete,
    inputMode,
    "data-field": name,
    "aria-invalid": Boolean(error) || undefined,
    "aria-describedby": error ? errId : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    className: cn(
      "peer block w-full border-0 border-b bg-transparent px-0 pb-3 pt-7 text-lg text-bone outline-none transition-colors duration-300 [color-scheme:dark] placeholder:text-transparent focus:border-bone disabled:opacity-40",
      error ? "border-safelight" : "border-line-strong",
    ),
    placeholder: label,
  };
  return (
    <div className="relative">
      {textarea ? <textarea rows={4} {...common} className={cn(common.className, "resize-none")} /> : <input type={type} {...common} />}
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-0 origin-left text-mute transition-all duration-300 ease-expo",
          filled ? "top-0 text-xs tracking-wide" : "top-7 text-lg peer-focus:top-0 peer-focus:text-xs peer-focus:tracking-wide",
        )}
      >
        {label}
        {required && <span className="text-safelight"> *</span>}
      </label>
      <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-bone transition-transform duration-500 ease-expo peer-focus:scale-x-100" />
      {error && (
        <p id={errId} className="mt-2 text-sm text-safelight">
          {error}
        </p>
      )}
    </div>
  );
}

function ChipGroup({
  label,
  name,
  options,
  value,
  onChange,
  error,
  required,
  compact,
}: {
  label: string;
  name: keyof Enquiry;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  compact?: boolean;
}) {
  const id = useId();
  return (
    <div role="radiogroup" aria-labelledby={id} aria-required={required} aria-invalid={Boolean(error) || undefined}>
      <p id={id} className="mb-4 text-sm text-mute">
        {label}
        {required && <span className="text-safelight"> *</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o, i) => {
          const on = value === o;
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={on}
              data-field={i === 0 ? name : undefined}
              onClick={() => onChange(on ? "" : o)}
              className={cn(
                "relative overflow-hidden rounded-full border transition-colors duration-300",
                compact ? "h-9 px-3.5 text-sm" : "h-11 px-5 text-[0.95rem]",
                on ? "border-bone text-ink" : "border-line-strong text-bone/80 hover:border-bone/60",
              )}
            >
              <span
                className={cn(
                  "absolute inset-0 origin-bottom bg-bone transition-transform duration-500 ease-expo",
                  on ? "scale-y-100" : "scale-y-0",
                )}
              />
              <span className="relative">{o}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-3 text-sm text-safelight">{error}</p>}
    </div>
  );
}
