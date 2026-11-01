/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONTENT: the single place to edit copy, contact details and projects.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Media keys (e.g. "hero", "work/wedding-01") refer to files you place in
 *  /public/media. Extensions are optional: "hero" matches hero.mp4, hero.mov,
 *  hero.jpg, … After adding or changing files run:  npm run media
 *  Any key without a file renders an elegant, clearly-labelled empty plate.
 */

export const brand = {
  name: "Beyond the Frame",
  descriptor: "Event Photography & Film",
  /** One-line positioning used in metadata & footer. */
  tagline:
    "Photography and film for weddings, traditional ceremonies and celebrations, directed with a cinematographer's eye.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://beyond-the-frame-indol.vercel.app",
} as const;

export const contact = {
  // TODO(client): replace every value below with real details.
  email: "hello@yourstudio.com",
  phone: "+254 742 182 160",
  phoneHref: "tel:+254742182160",
  /** wa.me link: country code + number, digits only. */
  whatsappHref: "https://wa.me/254742182160",
  location: "Kenya, travelling for events",
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
  { label: "How to book", href: "#process" },
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
    "Weddings, traditional ceremonies and celebrations, photographed and filmed with a director's eye, so the day you lived is the day you get to keep.",
  primaryCta: { label: "Book with us", href: "#contact" },
  secondaryCta: { label: "See the work", href: "#work" },
} as const;

export const studio = {
  label: "The Studio",
  definition: {
    word: "beyond the frame",
    partOfSpeech: "phr.",
    meaning:
      "We capture more than just how a moment looked. We capture how it felt, so you can relive it every time you look back.",
  },
  statement:
    "We are photographers and filmmakers for the days that matter most. We read the room, find the light and stay a step ahead of the moment, so nothing that matters slips past unseen.",
  pillars: ["Stills", "Motion", "Story"],
  media: ["photos/groom-portrait", "photos/celebration-fans", "photos/studio-satin"],
} as const;

export type Category = "Traditional" | "Weddings" | "Celebrations" | "Couples" | "Portraits" | "Brand Shoots";

export type Project = {
  slug: string;
  title: string;
  category: Category;
  /** "photo" | "film" | "both": drives the badge & cursor label */
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
 * PROJECTS: titles describe the work itself; no invented clients.
 * TODO(client): add real event names, locations & stories where you have permission.
 */
export const projects: Project[] = [
  {
    slug: "awaiting",
    title: "Awaiting",
    category: "Portraits",
    format: "photo",
    summary: "A maternity portrait built in the studio, with silk, ribbon and roses in one deep, warm tone.",
    cover: "photos/maternity",
    gallery: [],
  },
  {
    slug: "portrait-sessions",
    title: "Portrait Sessions",
    category: "Portraits",
    format: "photo",
    summary: "Warm light, a painted landscape and easy direction. Portraits for individuals, friends and anyone who wants to feel their best.",
    cover: "photos/portrait-pearls",
    gallery: ["photos/portrait-beige", "photos/friends-garden"],
  },
  {
    slug: "the-wedding-party",
    title: "The Wedding Party",
    category: "Weddings",
    format: "photo",
    summary:
      "Olive satin, blush pink and matching robes for getting ready. A bride and the women who stood beside her, from the first laugh of the morning to the portraits at the venue.",
    cover: "photos/wedding-party-olive",
    gallery: ["photos/wedding-party-pink", "photos/wedding-getting-ready"],
  },
  {
    slug: "the-procession",
    title: "The Procession",
    category: "Traditional",
    format: "photo",
    summary:
      "Walking sticks, wide-brimmed hats and a family arriving together. A traditional ceremony photographed as it moved.",
    cover: "photos/procession",
    gallery: ["photos/celebration-fans", "photos/groom-portrait"],
  },
  {
    slug: "the-reveal",
    title: "The Reveal",
    category: "Celebrations",
    format: "photo",
    summary: "A red carpet, a giant bow and one very big surprise, captured the moment it landed.",
    cover: "photos/gift-reveal",
    gallery: [],
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
    summary: "Caps, gowns and bouquets bigger than the graduates. A proud family day on the red carpet.",
    cover: "photos/grad-gowns",
    gallery: ["photos/grad-family"],
  },
  {
    slug: "the-birthday-shoot",
    title: "The Birthday Shoot",
    category: "Celebrations",
    format: "photo",
    summary: "Gold, tulle and a cake to match. A birthday celebrated with a portrait session by the pool and in the garden.",
    cover: "photos/birthday-poolside",
    gallery: ["photos/birthday-cake", "photos/birthday-seated", "photos/birthday-garden"],
  },
  {
    slug: "after-dark",
    title: "After Dark",
    category: "Couples",
    format: "photo",
    summary: "Blossom, lamplight and lace: a couple's session lit for the night.",
    cover: "photos/night-portrait",
    gallery: ["photos/night-couple"],
  },
  {
    slug: "uncaged",
    title: "Uncaged.",
    category: "Brand Shoots",
    format: "photo",
    summary:
      "A streetwear drop for Uncaged. Limits are the enemy: clean studio light, matching tees and the brand's message worn front and back.",
    cover: "photos/brand-uncaged-front",
    gallery: ["photos/brand-uncaged-back", "photos/brand-uncaged-hanger"],
  },
  {
    slug: "studio-editorial",
    title: "Studio Editorial",
    category: "Portraits",
    format: "photo",
    summary: "Bold colour, clean light and strong poses. Birthday and portrait sessions shot like a magazine spread.",
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


/** The featured film ("Now showing"). Kept out of Selected work on purpose. */
export const featuredFilm: Project = {
    slug: "waithera-kamau-ruracio",
    title: "Waithera & Kamau",
    category: "Traditional",
    format: "both",
    year: "2026",
    tagline: "A Ruracio, in film.",
    summary:
      "A Ruracio told in film: the arrival from the air, the hats and the walking sticks, the dancing, and the voice messages guests left for the couple.",
    cover: "stills/ruracio-fan",
    preview: "clips/ruracio-preview",
    film: "films/waithera-kamau-ruracio",
    gallery: ["stills/ruracio-aerial", "stills/ruracio-hats", "stills/ruracio-dance"],
  };

export type Service = {
  title: string;
  kicker: string;
  description: string;
  includes: string[];
  media: string;
  /** Pre-selects this event type in the enquiry form. */
  enquiryType: (typeof enquiry.eventTypes)[number];
};

/** Event types: copy describes scope, never invented results. */
export const services: Service[] = [
  {
    title: "Weddings",
    kicker: "Photo · Film · Both",
    description:
      "From the quiet of getting ready to the last song of the night, documented honestly, directed lightly, edited like cinema.",
    includes: ["Full-day coverage", "Highlight film", "Online gallery", "Heirloom prints"],
    media: "photos/bride-terrace",
    enquiryType: "Wedding",
  },
  {
    title: "Traditional",
    kicker: "Ruracio · Ngurario · Dowry ceremonies",
    description:
      "Ceremonies full of meaning, music and family. We know the moments that matter, and we're in position before they happen.",
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
      "Engagement shoots, maternity sessions and studio portraits, styled, lit and retouched with real care.",
    includes: ["Location or studio", "Styling direction", "Retouched selects", "Print-ready files"],
    media: "photos/night-portrait",
    enquiryType: "Portrait session",
  },
  {
    title: "Brand & Corporate",
    kicker: "Brand shoots · Launches · Conferences",
    description:
      "Campaign imagery for clothing and product brands, plus discreet coverage of launches and events that gives your team months of content.",
    includes: ["Product & apparel shoots", "Campaign imagery", "Launch & event coverage", "Social-ready edits"],
    media: "photos/brand-uncaged-front",
    enquiryType: "Brand & corporate",
  },
];

export const principles = [
  {
    title: "Directed, not just documented.",
    body: "We shape light, angles and timing so your event looks the way it felt: intentional, never accidental.",
    media: "photos/night-couple",
  },
  {
    title: "Stills and film, one vision.",
    body: "Photography and video planned together, so every image and every frame tells the same story.",
    media: "stills/ruracio-hats",
  },
  {
    title: "Invisible on the day.",
    body: "A calm, discreet presence. Your guests stay present in the moment. We take care of the rest.",
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
 * TESTIMONIALS: intentionally empty. Add real client words only.
 * The section hides itself automatically until at least one is added.
 */
export const testimonials: Testimonial[] = [];

/** Booking popup: photos shown per step / per event type (media keys). */
export const booking = {
  visuals: {
    steps: [
      "photos/procession",
      "photos/bride-terrace",
      "photos/wedding-party-pink",
      "photos/celebration-fans",
      "photos/night-couple",
    ],
    byType: {
      Wedding: "photos/bride-terrace",
      "Traditional ceremony": "photos/procession",
      Celebration: "photos/gift-reveal",
      "Brand & corporate": "photos/brand-uncaged-front",
      "Portrait session": "photos/studio-orange",
      "Something else": "photos/night-portrait",
    },
    teaser: ["photos/bride-terrace", "photos/procession", "photos/birthday-poolside", "photos/gift-reveal", "photos/night-couple"],
    done: "photos/wedding-party-olive",
  },
} as const;

export const enquiry = {
  eventTypes: ["Wedding", "Traditional ceremony", "Celebration", "Brand & corporate", "Portrait session", "Something else"],
  coverage: ["Photography", "Film", "Both"],
  // TODO(client): adjust currency & bands to match your pricing.
  budgets: ["Under KSh 50k", "KSh 50k-100k", "KSh 100k-250k", "KSh 250k +", "Not sure yet"],
} as const;
