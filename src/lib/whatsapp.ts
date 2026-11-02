import { brand, contact } from "@/content/site";

/** Everything a visitor can tell us; any field may be empty. */
export type BookingDetails = {
  eventType?: string;
  coverage?: string;
  date?: string;
  dateFlexible?: boolean;
  venue?: string;
  guests?: string;
  budget?: string;
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
};

function prettyDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/** The pre-filled WhatsApp message: readable at a glance on the studio's phone. */
export function bookingMessage(d: BookingDetails) {
  const date = d.dateFlexible ? "Not set yet" : d.date ? prettyDate(d.date) : "";
  const rows: [string, string | undefined][] = [
    ["Event", d.eventType],
    ["Date", date],
    ["Coverage", d.coverage],
    ["Venue", d.venue],
    ["Guests", d.guests],
    ["Budget", d.budget],
    ["Name", d.name],
    ["Phone", d.phone],
    ["Email", d.email],
  ];
  const lines = [
    `Hi ${brand.name}! I'd like to book you.`,
    "",
    ...rows.filter(([, v]) => v && v.trim()).map(([k, v]) => `*${k}:* ${v!.trim()}`),
  ];
  if (d.message?.trim()) lines.push("", d.message.trim());
  return lines.join("\n");
}

export function whatsappLink(text: string) {
  return `${contact.whatsappHref}?text=${encodeURIComponent(text)}`;
}

/**
 * Opens WhatsApp (app on phones, WhatsApp Web on desktop) with the message ready to send.
 * Must be called directly from a click/submit handler so browsers allow the new tab.
 */
export function openWhatsApp(text: string) {
  const url = whatsappLink(text);
  // Note: passing "noopener" makes window.open() always return null, so detach manually instead.
  const win = window.open(url, "_blank");
  if (win) win.opener = null;
  else window.location.href = url; // pop-up blocked: open WhatsApp in this tab instead
  return url;
}
