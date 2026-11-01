import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { brand, contact, socials } from "@/content/site";
import "./globals.css";

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const grotesk = Inter_Tight({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const title = `${brand.name} — ${brand.descriptor}`;

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: { default: title, template: `%s — ${brand.name}` },
  description: brand.tagline,
  keywords: [
    "event photographer",
    "event videographer",
    "wedding photography",
    "wedding videography",
    "corporate event photography",
    "event film",
    "concert photography",
    "party photographer",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: `${brand.name}`,
    title,
    description: brand.tagline,
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image", title, description: brand.tagline },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0a09",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: `${brand.name}`,
  description: brand.tagline,
  url: brand.url,
  email: contact.email,
  telephone: contact.phone,
  areaServed: contact.location,
  sameAs: socials.map((s) => s.href),
  knowsAbout: ["Event photography", "Event videography", "Wedding photography", "Wedding film"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${grotesk.variable} ${mono.variable}`}>
      <body>
        <a
          href="#main"
          className="fixed left-4 top-4 z-[200] -translate-y-24 rounded-full bg-bone px-4 py-2 text-sm text-ink transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
