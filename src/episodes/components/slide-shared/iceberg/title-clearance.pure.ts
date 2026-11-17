/*
 * Where a title Slide's words end, so its drawing can keep its figures below them (feedback 3, decisions 45 and 48):
 * the Title slide's hero and each Section title in the Surface start their words under the floating header, and the
 * ship's masthead must stay below the title's last line at every window size. The numbers mirror the page's own:
 * the header band (`--header-block`), the slide header's top padding (`pt-16 md:pt-24`) and the type tokens of the
 * title's role; line counts are generous, as the German titles run longer.
 */

/** A window, or a Slide's box, in CSS pixels. */
export interface TitleWindow {
  readonly width: number;
  readonly height: number;
}

export interface TitleRole {
  readonly min: number;
  readonly vw: number;
  readonly max: number;
  readonly leading: number;
}

const REM = 16;
export const HERO_ROLE: TitleRole = { min: 2.5 * REM, vw: 0.052, max: 4.5 * REM, leading: 1.05 };
export const HEADING_ROLE: TitleRole = { min: 2.25 * REM, vw: 0.042, max: 3.75 * REM, leading: 1.1 };

const STEPS = [80 * REM, 48 * REM, 0] as const;

export type TitleLines = readonly [wide: number, tablet: number, phone: number];

const HEADER_BLOCK = 4.875 * REM;

export function titleLines(width: number, lines: TitleLines): number {
  return lines[STEPS.findIndex((from) => width >= from)]!;
}

/**
 * Where the title's last line ends, in pixels from the Slide's top: the header band and the space under it (`below`,
 * 1rem on the Title slide, none on a Section title), the slide header's top padding, then each line at the role's size.
 */
export function titleBottom(
  { width }: TitleWindow,
  { role, lines, below }: { readonly role: TitleRole; readonly lines: TitleLines; readonly below: number },
): number {
  const size = Math.min(role.max, Math.max(role.min, role.vw * width));
  const padding = width >= 48 * REM ? 6 * REM : 4 * REM;
  return HEADER_BLOCK + below + padding + titleLines(width, lines) * role.leading * size;
}

export function titleLineStyle(lines: TitleLines): Readonly<Record<`--${string}`, string>> {
  const [wide, tablet, phone] = lines.map(String);
  return { '--title-lines-wide': wide!, '--title-lines-tablet': tablet!, '--title-lines-phone': phone! };
}
