/** Named ink profiles share the same rendering curve for scroll-triggered and clock-driven consumers. */
export const INK_PROFILES = {
  liquid: { bleed: 300, knee: 0.18 },
  paper: { bleed: 120, knee: 0.1 },
  glitch: { bleed: 200, knee: 0.15 },
  goo: { bleed: 250, knee: 0.15 },
  dither: { bleed: 100, knee: 0.08 },
  wave: { bleed: 180, knee: 0.12 },
  /** The Iceberg style's Section-title descent: the next zone rises through a froth of bubbles. */
  bubbles: { bleed: 220, knee: 0.12 },
} as const;

export function inkScale(variant: keyof typeof INK_PROFILES, progress: number) {
  const { knee } = INK_PROFILES[variant];
  return progress < 0.02 ? (progress / 0.02) * knee : knee + ((progress - 0.02) / 0.98) * (1 - knee);
}

/** Effects whose water rises by translation, so a crest drawn on its top edge keeps its shape. */
const TRANSLATED = new Set<keyof typeof INK_PROFILES>(['bubbles']);

/** The ink's CSS transform at `progress`: a bottom-origin scale, or for `bubbles` a rise from wholly below the host. */
export function inkTransform(variant: keyof typeof INK_PROFILES, progress: number) {
  const scale = inkScale(variant, progress);
  if (!TRANSLATED.has(variant)) return `scaleY(${scale})`;
  return `translateY(${Math.round((1 - scale) * 100_000) / 1000}%)`;
}
