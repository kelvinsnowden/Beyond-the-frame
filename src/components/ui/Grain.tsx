/** Fixed film-grain veil. A single tiny SVG noise tile, stepped by CSS. */
export function Grain() {
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden opacity-[0.055]">
      <div
        className="absolute -inset-[50%] motion-safe:animate-[grain_1.2s_steps(6)_infinite]"
        style={{ backgroundImage: `url("data:image/svg+xml,${svg}")` }}
      />
    </div>
  );
}
