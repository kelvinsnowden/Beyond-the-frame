# Beyond the Frame — event photography & film

Landing page built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4,
Motion and Lenis.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Editing content

All copy, contact details, services, projects and testimonials live in
**`src/content/site.ts`**. Items marked `TODO(client)` need real details
(email, phone, socials, budget bands, project names). The testimonials section
stays hidden until real quotes are added.

## Adding photos & films

1. Put files in `public/media/` (sub-folders are fine):
   - `photos/…jpg` — sRGB JPEGs, ~3200px on the long edge.
   - `clips/…mp4` — short muted loops (hover previews / ambient). Encoded automatically.
   - `films/…mp4` — full films with sound, **already web-encoded** (H.264 + AAC,
     faststart, under ~95 MB each). Served as-is.
2. Run `npm run media` (needs `ffmpeg`). It reads true dimensions, makes blur
   placeholders and posters, encodes clips to `public/media/_web/`, and writes
   `src/content/media.generated.json`.
3. Reference files in `site.ts` by path without extension, e.g. `"photos/procession"`.
   Missing files render as labelled “awaiting media” plates, so layouts never break.

## Bookings (WhatsApp)

The booking popup and the enquiry form both open WhatsApp with the visitor's
details already written out, addressed to the number in `contact.whatsappHref`
(`src/content/site.ts`). Nothing is stored on a server; the visitor just presses
send. The message format lives in `src/lib/whatsapp.ts`.

Also set `NEXT_PUBLIC_SITE_URL` for canonical / Open Graph URLs.
