"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, Check, Copy, MessageCircle, Phone } from "lucide-react";
import { useRef, useState } from "react";
import { contact, socials, testimonials } from "@/content/site";
import { FadeIn, MaskText, SectionLabel } from "@/components/ui/Reveal";
import { EnquiryForm } from "./EnquiryForm";

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.2"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const x = useTransform(scrollYProgress, [0, 1], ["-6%", "0%"]);
  const [copied, setCopied] = useState(false);

  return (
    <section id="contact" ref={ref} aria-labelledby="contact-title" className="gutter relative overflow-clip pb-16 pt-16 md:pt-40">
      <SectionLabel index={testimonials.length ? "07" : "06"}>Book your date</SectionLabel>

      <motion.h2
        id="contact-title"
        style={{ scale, x }}
        className="display mt-8 origin-left text-[clamp(3.6rem,13vw,15rem)] leading-[0.84]"
      >
        <MaskText className="block">Got a date</MaskText>
        <MaskText delay={0.12} className="block italic md:pl-[18vw]">
          in mind?
        </MaskText>
      </motion.h2>

      <div className="mt-10 grid gap-12 md:mt-24 md:gap-16 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <FadeIn>
            <p className="max-w-sm text-xl leading-relaxed text-bone/90">
              Tell us about your event. We&rsquo;ll confirm availability and come back with a
              tailored proposal. No obligation, no pressure.
            </p>
          </FadeIn>

          <FadeIn delay={0.1} className="mt-12 space-y-8 border-t border-line pt-8">
            <div>
              <p className="label text-mute">Call or WhatsApp</p>
              <div className="mt-3 flex items-center gap-3">
                <a href={contact.phoneHref} className="display text-[clamp(2.25rem,4vw,3.25rem)] leading-none">
                  {contact.phone}
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(contact.phone);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1800);
                    } catch {}
                  }}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line-strong text-mute hover:text-bone"
                  aria-label={copied ? "Number copied" : "Copy phone number"}
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                </button>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={contact.phoneHref}
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-bone px-6 text-sm font-medium text-ink"
                >
                  <Phone className="size-4" /> Call now
                </a>
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-line-strong px-6 text-sm transition-colors hover:border-bone"
                >
                  <MessageCircle className="size-4" /> WhatsApp us
                </a>
              </div>
            </div>
            <div>
              <p className="label text-mute">Email</p>
              <a href={`mailto:${contact.email}`} className="mt-2 block text-mute underline-offset-4 hover:text-bone hover:underline">
                {contact.email}
              </a>
            </div>
            <div>
              <p className="label text-mute">Based in</p>
              <p className="mt-2 text-lg md:text-xl">{contact.location}</p>
            </div>
            <div>
              <p className="label text-mute">Follow</p>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between py-3"
                    >
                      <span className="transition-transform duration-500 ease-expo group-hover:translate-x-2">
                        {s.label}
                      </span>
                      <ArrowUpRight className="size-4 text-mute transition-transform duration-500 group-hover:rotate-45 group-hover:text-bone" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </aside>

        <FadeIn className="lg:col-span-7 lg:col-start-6">
          <div className="border border-line bg-ink-2/60 p-6 sm:p-10 md:p-12">
            <EnquiryForm />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
