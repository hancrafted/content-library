/** Named ink profiles share the same rendering curve for scroll-triggered and clock-driven consumers. */
export const INK_PROFILES = {
  liquid: { bleed: 300, knee: 0.18 },
  paper: { bleed: 120, knee: 0.1 },
  glitch: { bleed: 200, knee: 0.15 },
  goo: { bleed: 250, knee: 0.15 },
  dither: { bleed: 100, knee: 0.08 },
  wave: { bleed: 180, knee: 0.12 },
} as const;

export function inkScale(variant: keyof typeof INK_PROFILES, progress: number) {
  const { knee } = INK_PROFILES[variant];
  return progress < 0.02 ? (progress / 0.02) * knee : knee + ((progress - 0.02) / 0.98) * (1 - knee);
}
