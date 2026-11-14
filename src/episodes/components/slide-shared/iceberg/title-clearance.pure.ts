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

/** A title's type role as `globals.css` sets it: `clamp(min, vw, max)` and its leading. */
export interface TitleRole {
  readonly min: number;
  readonly vw: number;
  readonly max: number;
  readonly leading: number;
}

const REM = 16;
/** The hero role, `--size-hero` and `--leading-hero`. */
export const HERO_ROLE: TitleRole = { min: 2.5 * REM, vw: 0.052, max: 4.5 * REM, leading: 1.05 };
/** The heading role a Section title takes, `--size-heading` and `--leading-heading`. */
export const HEADING_ROLE: TitleRole = { min: 2.25 * REM, vw: 0.042, max: 3.75 * REM, leading: 1.1 };

/** Where the line counts step, wide screens first, as the CSS modules read them through `titleLineStyle`. */
const STEPS = [80 * REM, 48 * REM, 0] as const;

/** A title's line counts on a wide screen, a tablet and a phone. */
export type TitleLines = readonly [wide: number, tablet: number, phone: number];

/** The floating header's band (`--header-block`, 4.875rem). */
const HEADER_BLOCK = 4.875 * REM;

/** How many lines the title takes at a width. */
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

/** The line counts as custom properties a CSS module picks by breakpoint: `--title-lines-wide` and on. */
export function titleLineStyle(lines: TitleLines): Readonly<Record<`--${string}`, string>> {
  const [wide, tablet, phone] = lines.map(String);
  return { '--title-lines-wide': wide!, '--title-lines-tablet': tablet!, '--title-lines-phone': phone! };
}
