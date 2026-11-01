import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { brand, hero } from "@/content/site";

export const alt = `${brand.name} — ${brand.descriptor}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card: the lead hero photograph with the headline set over it.
 *  _og/og-photo.jpg is a baseline (non-progressive) 1200×630 crop — Satori mis-decodes progressive JPEGs. */
/** Fetch a TTF from Google Fonts (Satori can't read woff2). Falls back silently. */
async function googleFont(family: string, italic: boolean) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:ital@${italic ? 1 : 0}`,
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return { name: family, data: await fetch(url).then((r) => r.arrayBuffer()), style: italic ? ("italic" as const) : ("normal" as const), weight: 400 as const };
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const fonts = (await Promise.all([googleFont("Instrument Serif", false), googleFont("Instrument Serif", true)])).filter(
    (f): f is NonNullable<typeof f> => f !== null,
  );
  const photo = await readFile(join(process.cwd(), "src/app/_og/og-photo.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", color: "#ede7dd", backgroundColor: "#0b0a09", backgroundImage: `url(${src})`, backgroundSize: "1200px 630px", backgroundPosition: "0px 0px", backgroundRepeat: "no-repeat", fontFamily: fonts.length ? "Instrument Serif" : "serif" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background: "linear-gradient(90deg, rgba(11,10,9,0.92) 0%, rgba(11,10,9,0.55) 55%, rgba(11,10,9,0.15) 100%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, letterSpacing: 4, fontFamily: "monospace", opacity: 0.8 }}>
            <span style={{ width: 12, height: 12, borderRadius: 12, background: "#d9482f" }} />
            {brand.descriptor.toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 140, lineHeight: 0.9, letterSpacing: -5 }}>
            <span>{hero.headline.slice(0, 2).join(" ")}</span>
            <span style={{ fontStyle: "italic" }}>{hero.headline[2]}</span>
          </div>
          <div style={{ display: "flex", fontSize: 44 }}>
            Beyond&nbsp;<span style={{ fontStyle: "italic" }}>the</span>&nbsp;Frame
            <span style={{ color: "#d9482f" }}>.</span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
