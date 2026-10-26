// Colour conversion for the dev-only token editor's picker: reads a token's colour
// (oklch, hex or hsl) as the hex the picker works in, and writes a picked hex back
// in the token's own format. sRGB only; an oklch colour outside it is clamped.
// No DOM, no React.

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function oklchToRgb(l: number, c: number, h: number): Pick<Rgba, 'r' | 'g' | 'b'> {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: clamp01(fromLinear(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_)),
    g: clamp01(fromLinear(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_)),
    b: clamp01(fromLinear(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_)),
  };
}

function rgbToOklch({ r, g, b }: Pick<Rgba, 'r' | 'g' | 'b'>) {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  return {
    l: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    c: Math.hypot(a, bb),
    h: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360,
  };
}

function hslToRgb(h: number, s: number, l: number): Pick<Rgba, 'r' | 'g' | 'b'> {
  const k = (n: number) => (n + h / 30) % 12;
  const amp = s * Math.min(l, 1 - l);
  const f = (n: number) => l - amp * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: f(0), g: f(8), b: f(4) };
}

function parseAlpha(text: string | undefined): number {
  if (text === undefined) return 1;
  const value = text.trim().endsWith('%') ? parseFloat(text) / 100 : parseFloat(text);
  return Number.isFinite(value) ? clamp01(value) : 1;
}

const NUMBER = String.raw`[-+]?(?:\d+\.?\d*|\.\d+)`;
const ALPHA = String.raw`(?:\s*[/,]\s*(${NUMBER}%?))?`;
const OKLCH = new RegExp(String.raw`^oklch\(\s*(${NUMBER})(%?)\s+(${NUMBER})\s+(${NUMBER})(?:deg)?${ALPHA}\s*\)$`, 'i');
const HSL = new RegExp(
  String.raw`^hsla?\(\s*(${NUMBER})(?:deg)?[\s,]+(${NUMBER})%[\s,]+(${NUMBER})%${ALPHA}\s*\)$`,
  'i',
);
const RGB = new RegExp(String.raw`^rgba?\(\s*(${NUMBER})[\s,]+(${NUMBER})[\s,]+(${NUMBER})${ALPHA}\s*\)$`, 'i');
const LAB = new RegExp(String.raw`^lab\(\s*(${NUMBER})(%?)\s+(${NUMBER})\s+(${NUMBER})${ALPHA}\s*\)$`, 'i');
const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function parseHex(digits: string): Rgba {
  const full = digits.length <= 4 ? [...digits].map((d) => d + d).join('') : digits;
  const byte = (i: number) => parseInt(full.slice(i, i + 2), 16) / 255;
  return { r: byte(0), g: byte(2), b: byte(4), a: full.length === 8 ? byte(6) : 1 };
}

// CIE Lab (D50) to Oklab, through XYZ: the form a browser serves an oklch colour in once a build has rewritten it.
function labToOklch(lab: number, a: number, b: number) {
  const fy = (lab + 16) / 116;
  const [fx, fz] = [fy + a / 500, fy - b / 200];
  const inverse = (t: number) => (t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27));
  const x50 = 0.96422 * inverse(fx);
  const y50 = lab > 8 ? fy ** 3 : lab / (24389 / 27);
  const z50 = 0.82521 * inverse(fz);
  const x = 0.9554734527 * x50 - 0.0230985369 * y50 + 0.0632593087 * z50;
  const y = -0.028369707 * x50 + 1.009995458 * y50 + 0.021041399 * z50;
  const z = 0.0123140017 * x50 - 0.0205076964 * y50 + 1.3303659366 * z50;
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.633851707 * z);
  const ok = {
    l: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
  return { l: ok.l, c: Math.hypot(ok.a, ok.b), h: ((Math.atan2(ok.b, ok.a) * 180) / Math.PI + 360) % 360 };
}

function parseLab(text: string): { l: number; c: number; h: number; a: number } | null {
  const lab = LAB.exec(text);
  if (!lab) return null;
  const lightness = parseFloat(lab[1]);
  return { ...labToOklch(lightness, parseFloat(lab[3]), parseFloat(lab[4])), a: parseAlpha(lab[5]) };
}

function parseColour(value: string): Rgba | null {
  const text = value.trim();
  const lab = parseLab(text);
  if (lab) return { ...oklchToRgb(lab.l, lab.c, lab.h), a: lab.a };
  const hex = HEX.exec(text);
  if (hex) return parseHex(hex[1]);
  const oklch = OKLCH.exec(text);
  if (oklch) {
    const l = oklch[2] ? parseFloat(oklch[1]) / 100 : parseFloat(oklch[1]);
    return { ...oklchToRgb(l, parseFloat(oklch[3]), parseFloat(oklch[4])), a: parseAlpha(oklch[5]) };
  }
  const rgb = RGB.exec(text);
  if (rgb) {
    const [r, g, bl] = [rgb[1], rgb[2], rgb[3]].map((n) => parseFloat(n) / 255);
    return { r, g, b: bl, a: parseAlpha(rgb[4]) };
  }
  const hsl = HSL.exec(text);
  if (hsl) {
    return {
      ...hslToRgb(parseFloat(hsl[1]), parseFloat(hsl[2]) / 100, parseFloat(hsl[3]) / 100),
      a: parseAlpha(hsl[4]),
    };
  }
  return null;
}

const byteHex = (n: number) =>
  Math.round(clamp01(n) * 255)
    .toString(16)
    .padStart(2, '0');

/** The colour as `#rrggbb`, or `#rrggbbaa` when translucent: what the picker holds. `null` if the value is not a colour this reads. */
export function toPickerHex(value: string): string | null {
  const rgba = parseColour(value);
  if (!rgba) return null;
  return `#${byteHex(rgba.r)}${byteHex(rgba.g)}${byteHex(rgba.b)}${rgba.a < 1 ? byteHex(rgba.a) : ''}`;
}

/** Rounds to `places` and drops trailing zeros: `0.50` -> `0.5`. */
const trim = (n: number, places: number) => String(parseFloat(n.toFixed(places)));

function oklchText({ r, g, b, a }: Rgba): string {
  return oklchString({ ...rgbToOklch({ r, g, b }), a });
}

function oklchString({ l, c, h, a }: { l: number; c: number; h: number; a: number }): string {
  const chroma = parseFloat(c.toFixed(3));
  const hue = chroma === 0 ? 0 : parseFloat(h.toFixed(1)) % 360;
  const alpha = a < 1 ? ` / ${Math.round(a * 100)}%` : '';
  return `oklch(${trim(l, 3)} ${trim(chroma, 3)} ${hue}${alpha})`;
}

/**
 * A colour the browser served in a form the author did not write (`lab()`, from a
 * build that rewrote `oklch()`) as `oklch()` again; anything else comes back as it was.
 */
export function normaliseColour(value: string): string {
  const lab = parseLab(value.trim());
  return lab ? oklchString(lab) : value;
}

/**
 * A picked hex written in the format of the token it replaces: a hex token stays
 * hex, anything else (oklch, hsl) becomes `oklch(L C H)`, alpha as a percentage.
 */
export function formatLike(original: string, pickedHex: string): string {
  const picked = parseColour(pickedHex);
  if (!picked) return original;
  return HEX.test(original.trim()) ? (toPickerHex(pickedHex) ?? original).toLowerCase() : oklchText(picked);
}
