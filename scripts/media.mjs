#!/usr/bin/env node
/**
 * Media pipeline: run with `npm run media` after adding files to /public/media.
 *
 *  • Images: reads true dimensions and makes a tiny blur placeholder.
 *    (Delivery resizing / AVIF / WebP is handled by next/image at request time.)
 *  • Videos: encodes web-optimised, muted H.264 MP4s (1920px + 960px for mobile),
 *    moves the moov atom for fast start, and extracts a poster frame.
 *  • films/*: full films with sound, already web-encoded: served as-is
 *    (poster + blur only). Keep each under ~95 MB for git hosting.
 *  • Writes src/content/media.generated.json, keyed by path without extension.
 *
 * Originals are never modified. Requires ffmpeg / ffprobe on PATH.
 */
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mediaDir = path.join(root, "public", "media");
const outDir = path.join(mediaDir, "_web");
const imgDir = path.join(mediaDir, "_img");
/** Static responsive widths. Must match images.deviceSizes + imageSizes in next.config.ts. */
const WIDTHS = [128, 256, 384, 640, 828, 1200, 1920, 2560];
const manifestPath = path.join(root, "src", "content", "media.generated.json");

const IMAGE = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const VIDEO = new Set([".mp4", ".mov", ".m4v", ".webm"]);

const run = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"] }).toString();

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return d.name.startsWith("_") ? [] : walk(p);
    return d.name.startsWith(".") ? [] : [p];
  });
}

function probe(file) {
  const out = JSON.parse(
    run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries",
      "stream=width,height:stream_side_data=rotation:stream_tags=rotate:format=duration", "-of", "json", file]),
  );
  const s = out.streams?.[0] ?? {};
  let { width, height } = s;
  const rot = Math.abs(Number(s.tags?.rotate ?? s.side_data_list?.[0]?.rotation ?? 0));
  if (rot === 90 || rot === 270) [width, height] = [height, width];
  return { width, height, duration: Number(out.format?.duration ?? 0) };
}

function blurFrom(file, seek) {
  const args = ["-v", "error", ...(seek ? ["-ss", String(seek)] : []), "-i", file,
    "-frames:v", "1", "-vf", "scale=24:-2", "-q:v", "6", "-f", "image2", "-c:v", "mjpeg", "pipe:1"];
  const buf = execFileSync("ffmpeg", args, { maxBuffer: 1 << 20 });
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

/**
 * Pre-render static WebP variants (content-hashed, cache-forever) so the site
 * never waits on an on-demand image optimiser.
 */
function imageVariants(file, key, width) {
  const hash = crypto.createHash("sha1").update(fs.readFileSync(file)).digest("hex").slice(0, 8);
  const flat = key.replaceAll("/", "__");
  const widths = [...WIDTHS.filter((w) => w < width), Math.min(width, 2560)].filter((w, i, a) => a.indexOf(w) === i);
  // Drop variants left over from a previous version of this image.
  for (const f of fs.readdirSync(imgDir)) {
    if (f.startsWith(`${flat}.`) && !f.startsWith(`${flat}.${hash}.`)) fs.rmSync(path.join(imgDir, f));
  }
  for (const w of widths) {
    const out = path.join(imgDir, `${flat}.${hash}.${w}.webp`);
    if (fs.existsSync(out)) continue;
    run("ffmpeg", ["-y", "-v", "error", "-i", file, "-vf", `scale=${w}:-2:flags=lanczos`,
      "-c:v", "libwebp", "-quality", w <= 384 ? "72" : "78", "-compression_level", "6", out]);
  }
  return { base: `/media/_img/${flat}.${hash}`, widths };
}

const fresh = (src, out) => fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs;

function encode(src, out, maxW, crf) {
  if (fresh(src, out)) return;
  run("ffmpeg", ["-y", "-v", "error", "-i", src, "-an",
    "-vf", `scale='min(${maxW},iw)':-2:flags=lanczos,format=yuv420p`,
    "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-profile:v", "high",
    "-movflags", "+faststart", out]);
}

const manifest = {};
const files = walk(mediaDir);
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(imgDir, { recursive: true });

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  const rel = path.relative(mediaDir, file);
  const key = rel.slice(0, -ext.length).split(path.sep).join("/");
  const url = "/media/" + rel.split(path.sep).map(encodeURIComponent).join("/");

  try {
    if (IMAGE.has(ext)) {
      const { width, height } = probe(file);
      const variants = imageVariants(file, key, width);
      manifest[key] = { kind: "image", src: url, width, height, blur: blurFrom(file), variants };
      console.log(`  image  ${key}  ${width}×${height}`);
    } else if (VIDEO.has(ext)) {
      const { width, height, duration } = probe(file);
      const base = key.replaceAll("/", "__");
      const poster = path.join(outDir, `${base}.poster.jpg`);
      // films/* are full-length, sound-on films: supply them already web-encoded
      // (H.264 + AAC, faststart) and they are served as-is.
      const isFilm = key.startsWith("films/");
      const lg = isFilm ? null : path.join(outDir, `${base}.1920.mp4`);
      const sm = isFilm ? null : path.join(outDir, `${base}.960.mp4`);
      if (!isFilm) {
        encode(file, lg, 1920, 23);
        encode(file, sm, 960, 27);
      }
      const seek = isFilm ? Math.min(20, duration / 3) : Math.min(1, duration / 3);
      if (!fresh(file, poster)) {
        run("ffmpeg", ["-y", "-v", "error", "-ss", String(seek), "-i", file, "-frames:v", "1",
          "-vf", "scale='min(1920,iw)':-2", "-q:v", "3", poster]);
      }
      manifest[key] = {
        kind: "video",
        src: isFilm ? url : `/media/_web/${base}.1920.mp4`,
        srcSmall: isFilm ? undefined : `/media/_web/${base}.960.mp4`,
        poster: `/media/_web/${base}.poster.jpg`,
        width, height,
        duration: Math.round(duration),
        blur: blurFrom(file, seek),
      };
      console.log(`  video  ${key}  ${width}×${height}  ${duration.toFixed(1)}s`);
    } else if (ext === ".heic" || ext === ".heif") {
      console.warn(`  skip   ${rel}: convert HEIC to JPEG first`);
    }
  } catch (e) {
    console.warn(`  error  ${rel}: ${e.message.split("\n")[0]}`);
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\n✓ ${Object.keys(manifest).length} assets → ${path.relative(root, manifestPath)}`);
