"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { contact, nav, socials } from "@/content/site";
import { useExperience } from "@/components/providers/Experience";

/** Full-screen menu (mobile & tablet). Opens like an iris from the top-right. */
export function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lockScroll } = useExperience();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    const first = panel.current?.querySelector<HTMLElement>("a");
    first?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("a, button");
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
  }, [open, onClose, lockScroll]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="site-menu"
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="gutter fixed inset-0 z-40 flex flex-col justify-between bg-ink-2 pb-8 pt-28"
          initial={{ clipPath: "circle(0% at calc(100% - 3rem) 2.5rem)" }}
          animate={{ clipPath: "circle(150% at calc(100% - 3rem) 2.5rem)" }}
          exit={{ clipPath: "circle(0% at calc(100% - 3rem) 2.5rem)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <nav aria-label="Menu">
            <ul className="space-y-1">
              {nav.map((item, i) => (
                <li key={item.href} className="overflow-hidden">
                  <motion.a
                    href={item.href}
                    onClick={onClose}
                    className="display group flex items-baseline gap-4 py-1 text-[15vw] leading-[0.95] sm:text-[11vw]"
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.06 }}
                  >
                    <span className="label translate-y-[-0.6em] text-xs text-mute">0{i + 1}</span>
                    <span className="transition-[font-style] group-hover:italic">{item.label}</span>
                  </motion.a>
                </li>
              ))}
            </ul>
          </nav>

          <motion.div
            className="grid gap-6 border-t border-line pt-6 text-sm sm:grid-cols-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.6 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <div className="space-y-1">
              <p className="label text-mute">Call or WhatsApp</p>
              <a href={contact.phoneHref} className="display block text-3xl">
                {contact.phone}
              </a>
              <a href={contact.whatsappHref} target="_blank" rel="noreferrer" className="block text-mute hover:text-bone">
                Message us on WhatsApp
              </a>
              <a href={`mailto:${contact.email}`} className="block text-sm text-mute hover:text-bone">
                {contact.email}
              </a>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end sm:self-end">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="text-mute hover:text-bone">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
