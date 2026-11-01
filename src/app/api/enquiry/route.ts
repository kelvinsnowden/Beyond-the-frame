import { validateEnquiry, type Enquiry } from "@/lib/enquiry-schema";
import { brand } from "@/content/site";

/**
 * POST /api/enquiry
 *
 * Delivery is configured with environment variables (see .env.example):
 *   RESEND_API_KEY + ENQUIRY_TO_EMAIL (+ optional ENQUIRY_FROM_EMAIL) → email via Resend
 *   ENQUIRY_WEBHOOK_URL                                              → JSON POST (Zapier, Make, Slack, CRM…)
 * Both may be set. With neither configured, development logs the enquiry;
 * production responds 503 so the form can show the direct email fallback.
 */

const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  let body: Partial<Enquiry>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Bots fill hidden fields; pretend success and drop it.
  if (body.website) return Response.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return Response.json({ ok: false, error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const errors = validateEnquiry(body);
  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 422 });

  const e = body as Enquiry;
  const rows: [string, string][] = [
    ["Event", e.eventType],
    ["Coverage", e.coverage || "-"],
    ["Date", e.dateFlexible ? "Not set yet" : e.date],
    ["Venue / location", e.venue || "-"],
    ["Guests", e.guests || "-"],
    ["Budget", e.budget || "-"],
    ["Name", e.name],
    ["Email", e.email],
    ["Phone", e.phone || "-"],
  ];
  const subject = `New enquiry: ${e.eventType}${e.dateFlexible ? "" : `, ${e.date}`}, from ${e.name}`;

  const { RESEND_API_KEY, ENQUIRY_TO_EMAIL, ENQUIRY_FROM_EMAIL, ENQUIRY_WEBHOOK_URL } = process.env;
  const tasks: Promise<Response>[] = [];

  if (RESEND_API_KEY && ENQUIRY_TO_EMAIL) {
    const html = `<h2 style="font-family:Georgia,serif">${esc(subject)}</h2><table cellpadding="6">${rows
      .map(([k, v]) => `<tr><td style="color:#888">${esc(k)}</td><td>${esc(v)}</td></tr>`)
      .join("")}</table><p style="white-space:pre-wrap">${esc(e.message || "")}</p>`;
    tasks.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: ENQUIRY_FROM_EMAIL || `${brand.name} Website <onboarding@resend.dev>`,
          to: ENQUIRY_TO_EMAIL.split(",").map((s) => s.trim()),
          reply_to: e.email,
          subject,
          html,
        }),
      }),
    );
  }

  if (ENQUIRY_WEBHOOK_URL) {
    tasks.push(
      fetch(ENQUIRY_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, ...e, website: undefined, receivedAt: new Date().toISOString() }),
      }),
    );
  }

  if (tasks.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[enquiry] (no delivery configured, logged only)\n", subject, "\n", rows, "\n", e.message);
      return Response.json({ ok: true, delivered: false });
    }
    return Response.json(
      { ok: false, error: "Online enquiries are temporarily unavailable." },
      { status: 503 },
    );
  }

  const results = await Promise.allSettled(tasks);
  const delivered = results.some((r) => r.status === "fulfilled" && r.value.ok);
  if (!delivered) {
    console.error("[enquiry] delivery failed", results);
    return Response.json({ ok: false, error: "We couldn't send that just now." }, { status: 502 });
  }
  return Response.json({ ok: true, delivered: true });
}
