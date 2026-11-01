/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONTENT — the single place to edit copy, contact details and projects.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Media keys (e.g. "hero", "work/wedding-01") refer to files you place in
 *  /public/media. Extensions are optional — "hero" matches hero.mp4, hero.mov,
 *  hero.jpg, … After adding or changing files run:  npm run media
 *  Any key without a file renders an elegant, clearly-labelled empty plate.
 */

export const brand = {
  name: "Beyond the Frame",
  descriptor: "Event Photography & Film",
  /** One-line positioning used in metadata & footer. */
  tagline:
    "Photography and film for weddings, traditional ceremonies and celebrations — directed with a cinematographer's eye.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://beyond-the-frame-indol.vercel.app",
} as const;

export const contact = {
  // TODO(client): replace every value below with real details.
  email: "hello@yourstudio.com",
  phone: "+254 700 000 000",
  phoneHref: "tel:+254700000000",
  location: "Kenya — travelling for events",
  responseNote: "Every enquiry is answered personally.",
  timezone: "Africa/Nairobi",
} as const;

export const socials: { label: string; href: string }[] = [
  // TODO(client): point these at the studio's real profiles.
  { label: "Instagram", href: "https://instagram.com/" },
  { label: "TikTok", href: "https://tiktok.com/" },
  { label: "YouTube", href: "https://youtube.com/" },
  { label: "Vimeo", href: "https://vimeo.com/" },
];

export const nav = [
  { label: "Work", href: "#work" },
  { label: "Film", href: "#film" },
  { label: "Events", href: "#services" },
  { label: "Studio", href: "#studio" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
] as const;

export type HeroFrame = {
  media: string;
  /** object-position for wide (desktop) and tall (mobile) crops */
  focal: string;
  focalMobile?: string;
  caption: string;
};

export const hero = {
  /** Stills cycle like a film sequence; first frame is the LCP image. */
  frames: [
    { media: "photos/procession", focal: "55% 40%", focalMobile: "58% 50%", caption: "Traditional ceremony" },
    { media: "photos/bride-terrace", focal: "50% 30%", focalMobile: "50% 50%", caption: "Wedding portrait" },
    { media: "photos/night-couple", focal: "50% 34%", focalMobile: "50% 55%", caption: "Couples, after dark" },
  ] satisfies HeroFrame[],
  eyebrow: "Event photography & film",
  headline: ["It only", "happens", "once."],
  statement:
    "Weddings, traditional ceremonies and celebrations — photographed and filmed with a director's eye, so the day you lived is the day you get to keep.",
  primaryCta: { label: "Check your date", href: "#contact" },
  secondaryCta: { label: "See the work", href: "#work" },
} as const;

export const studio = {
  label: "The Studio",
  definition: {
    word: "beyond the frame",
    partOfSpeech: "phr.",
    meaning:
      "Everything a picture holds that its edges can't — the feeling in the room, the sound of the night, the people just out of shot.",
  },
  statement:
    "We are photographers and filmmakers for the days that matter most. We read the room, find the light and stay a step ahead of the moment — so nothing that matters slips past unseen.",
  pillars: ["Stills", "Motion", "Story"],
  media: ["photos/groom-portrait", "photos/celebration-fans", "photos/couple-terrace"],
} as const;

export type Category = "Traditional" | "Weddings" | "Celebrations" | "Couples" | "Portraits";

export type Project = {
  slug: string;
  title: string;
  category: Category;
  /** "photo" | "film" | "both" — drives the badge & cursor label */
  format: "photo" | "film" | "both";
  year?: string;
  location?: string;
  /** Short line used where the project's film is featured. */
  tagline?: string;
  summary?: string;
  /** Cover still. A short muted clip in `preview` plays on hover. */
  cover: string;
  preview?: string;
  /** Full film (shown with controls in the project viewer). */
  film?: string;
  gallery: string[];
  /** Fallback aspect ratio for empty plates [w, h]. */
  aspect?: [number, number];
};

/**
 * PROJECTS — titles describe the work itself; no invented clients.
 * TODO(client): add real event names, locations & stories where you have permission.
 */
export const projects: Project[] = [
  {
    slug: "waithera-kamau-ruracio",
    title: "Waithera & Kamau",
    category: "Traditional",
    format: "both",
    year: "2026",
    tagline: "A Ruracio, in film.",
    summary:
      "A Ruracio told in film — the arrival from the air, the hats and the walking sticks, the dancing, the vows under an umbrella, and the voice messages guests left for the couple.",
    cover: "stills/ruracio-umbrella",
    preview: "clips/ruracio-preview",
    film: "films/waithera-kamau-ruracio",
    gallery: ["stills/ruracio-aerial", "stills/ruracio-hats", "stills/ruracio-dance", "stills/ruracio-fan"],
  },
  {
    slug: "the-procession",
    title: "The Procession",
    category: "Traditional",
    format: "photo",
    summary:
      "Walking sticks, wide-brimmed hats and a family arriving together — a traditional ceremony photographed as it moved.",
    cover: "photos/procession",
    gallery: ["photos/celebration-fans", "photos/couple-terrace", "photos/groom-portrait"],
  },
  {
    slug: "the-bride",
    title: "The Bride",
    category: "Weddings",
    format: "photo",
    summary: "Golden hour on the terrace, minutes before the ceremony.",
    cover: "photos/bride-terrace",
    gallery: [],
  },
  {
    slug: "graduation-day",
    title: "Graduation Day",
    category: "Celebrations",
    format: "photo",
    summary: "Caps, gowns and bouquets bigger than the graduates — a proud family day on the red carpet.",
    cover: "photos/grad-gowns",
    gallery: ["photos/grad-family"],
  },
  {
    slug: "the-reveal",
    title: "The Reveal",
    category: "Celebrations",
    format: "photo",
    summary: "A red carpet, a giant bow and one very big surprise — captured the moment it landed.",
    cover: "photos/gift-reveal",
    gallery: [],
  },
  {
    slug: "after-dark",
    title: "After Dark",
    category: "Couples",
    format: "photo",
    summary: "Blossom, lamplight and lace — a couple's session lit for the night.",
    cover: "photos/night-portrait",
    gallery: ["photos/night-couple"],
  },
  {
    slug: "awaiting",
    title: "Awaiting",
    category: "Portraits",
    format: "photo",
    summary: "A maternity portrait built in the studio — silk, ribbon and roses in one deep, warm tone.",
    cover: "photos/maternity",
    gallery: [],
  },
  {
    slug: "studio-editorial",
    title: "Studio Editorial",
    category: "Portraits",
    format: "photo",
    summary: "Bold colour, clean light and strong poses — birthday and portrait sessions shot like a magazine spread.",
    cover: "photos/studio-orange",
    gallery: [
      "photos/studio-suit",
      "photos/studio-copper",
      "photos/studio-satin",
      "photos/studio-sequin",
      "photos/studio-staircase",
      "photos/studio-denim",
    ],
  },
];

export type Service = {
  title: string;
  kicker: string;
  description: string;
  includes: string[];
  media: string;
  /** Pre-selects this event type in the enquiry form. */
  enquiryType: (typeof enquiry.eventTypes)[number];
};

/** Event types — copy describes scope, never invented results. */
export const services: Service[] = [
  {
    title: "Weddings",
    kicker: "Photo · Film · Both",
    description:
      "From the quiet of getting ready to the last song of the night — documented honestly, directed lightly, edited like cinema.",
    includes: ["Full-day coverage", "Highlight film", "Online gallery", "Heirloom prints"],
    media: "photos/bride-terrace",
    enquiryType: "Wedding",
  },
  {
    title: "Traditional",
    kicker: "Ruracio · Ngurario · Dowry ceremonies",
    description:
      "Ceremonies full of meaning, music and family. We know the moments that matter — and we're in position before they happen.",
    includes: ["Photo & film coverage", "Aerial footage", "Audio guestbook film", "Family portraits"],
    media: "photos/procession",
    enquiryType: "Traditional ceremony",
  },
  {
    title: "Celebrations",
    kicker: "Birthdays · Graduations · Surprises",
    description:
      "Milestones deserve more than phone footage. We capture the atmosphere, the people and the details you planned for months.",
    includes: ["Candid & guest coverage", "Detail & décor", "Same-week previews", "Social-ready edits"],
    media: "photos/gift-reveal",
    enquiryType: "Celebration",
  },
  {
    title: "Portraits",
    kicker: "Couples · Maternity · Studio",
    description:
      "Engagement shoots, maternity sessions and studio portraits — styled, lit and retouched with real care.",
    includes: ["Location or studio", "Styling direction", "Retouched selects", "Print-ready files"],
    media: "photos/night-portrait",
    enquiryType: "Portrait session",
  },
  {
    title: "Corporate",
    kicker: "Conferences · Galas · Launches",
    description:
      "Discreet, professional coverage that gives your team months of content — speakers, guests, brand moments and recap films.",
    includes: ["Keynotes & panels", "Brand activations", "Recap films", "Fast-turnaround selects"],
    media: "",
    enquiryType: "Corporate",
  },
];

export const principles = [
  {
    title: "Directed, not just documented.",
    body: "We shape light, angles and timing so your event looks the way it felt — intentional, never accidental.",
    media: "photos/night-couple",
  },
  {
    title: "Stills and film, one vision.",
    body: "Photography and video planned together, so every image and every frame tells the same story.",
    media: "stills/ruracio-umbrella",
  },
  {
    title: "Invisible on the day.",
    body: "A calm, discreet presence. Your guests stay present in the moment — we take care of the rest.",
    media: "photos/celebration-fans",
  },
  {
    title: "Obsessive in the finish.",
    body: "Colour, edit and sound are given the same care as the shoot. Nothing leaves the studio until it's right.",
    media: "photos/maternity",
  },
] as const;

export const processSteps = [
  { step: "Enquire", body: "Tell us your date, venue and the kind of coverage you're imagining." },
  { step: "Plan", body: "We shape a tailored proposal and a shot plan around your day." },
  { step: "Capture", body: "We arrive early, read the room and capture it as it unfolds." },
  { step: "Deliver", body: "A beautifully finished gallery and film, ready to relive and share." },
] as const;

export type Testimonial = {
  quote: string;
  name: string;
  /** e.g. "Wedding, Lake Como" or "Head of Events, Company" */
  context?: string;
  media?: string;
};

/**
 * TESTIMONIALS — intentionally empty. Add real client words only.
 * The section hides itself automatically until at least one is added.
 */
export const testimonials: Testimonial[] = [];

export const enquiry = {
  eventTypes: ["Wedding", "Traditional ceremony", "Celebration", "Corporate", "Portrait session", "Something else"],
  coverage: ["Photography", "Film", "Both"],
  // TODO(client): adjust currency & bands to match your pricing.
  budgets: ["Under KSh 50k", "KSh 50k – 100k", "KSh 100k – 250k", "KSh 250k +", "Not sure yet"],
} as const;
