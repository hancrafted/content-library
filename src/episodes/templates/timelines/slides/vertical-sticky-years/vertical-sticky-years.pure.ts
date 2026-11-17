export interface YearEntry {
  date: string;
  title: string;
  caption: string;
}

export type ChipTone = 'primary' | 'foreground' | 'muted-foreground';

export const CHIP_GLYPHS = ['◆', '●', '▲', '■', '✦', '◐'] as const;

const CHIP_TONES: readonly ChipTone[] = ['primary', 'foreground', 'muted-foreground'];

export interface PlacedEntry extends YearEntry {
  index: number;
  glyph: (typeof CHIP_GLYPHS)[number];
  tone: ChipTone;
}

export interface YearGroup {
  year: string;
  entries: PlacedEntry[];
}

export function groupByYear(entries: readonly YearEntry[]): YearGroup[] {
  return entries.reduce<YearGroup[]>((groups, entry, index) => {
    const year = entry.date.trim();
    if (year === '') throw new Error(`The entry "${entry.title}" has no date, so it has no year to pin.`);
    const placed: PlacedEntry = {
      ...entry,
      index,
      glyph: CHIP_GLYPHS[index % CHIP_GLYPHS.length],
      tone: CHIP_TONES[index % CHIP_TONES.length],
    };
    const last = groups.at(-1);
    if (last?.year === year) last.entries.push(placed);
    else groups.push({ year, entries: [placed] });
    return groups;
  }, []);
}
