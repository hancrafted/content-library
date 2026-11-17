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
