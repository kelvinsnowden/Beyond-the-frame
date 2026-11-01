import generated from "@/content/media.generated.json";

export type ImageAsset = {
  kind: "image";
  key: string;
  src: string;
  width: number;
  height: number;
  blur?: string;
  alt: string;
};

export type VideoAsset = {
  kind: "video";
  key: string;
  src: string;
  /** Lighter encode for small screens / slow connections. */
  srcSmall?: string;
  poster: string;
  width: number;
  height: number;
  /** seconds */
  duration?: number;
  blur?: string;
  alt: string;
};

export type EmptyPlate = {
  kind: "empty";
  key: string;
  width: number;
  height: number;
  alt: string;
};

export type Media = ImageAsset | VideoAsset | EmptyPlate;

type GeneratedEntry =
  | { kind: "image"; src: string; width: number; height: number; blur?: string }
  | {
      kind: "video";
      src: string;
      srcSmall?: string;
      poster: string;
      width: number;
      height: number;
      duration?: number;
      blur?: string;
    };

const manifest = generated as Record<string, GeneratedEntry>;

/**
 * Resolve a media key (path under /public/media without extension).
 * Returns an EmptyPlate when the asset has not been supplied yet, so the
 * layout always holds its shape.
 */
export function media(
  key: string | undefined,
  alt = "",
  fallback: [number, number] = [3, 2],
): Media {
  const entry = key ? manifest[key] : undefined;
  if (!entry || !key) {
    return { kind: "empty", key: key ?? "", width: fallback[0], height: fallback[1], alt };
  }
  return { ...entry, key, alt } as Media;
}

export const hasMedia = (key?: string) => Boolean(key && manifest[key]);

export const aspectOf = (m: Media) => m.width / m.height;
