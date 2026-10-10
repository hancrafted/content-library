/** One changelog entry as the Slide reads it from its Translation keys. */
export interface YearEntry {
  date: string;
  title: string;
  caption: string;
}

/** The chip tones, each a site token for one shared meaning; a chip cycles through them with its glyph. */
export type ChipTone = 'machine' | 'human' | 'ai';

/** Category glyphs a chip carries. Placeholder categories: the timeline has no category keys, so place picks one. */
export const CHIP_GLYPHS = ['◆', '●', '▲', '■', '✦', '◐'] as const;

const CHIP_TONES: readonly ChipTone[] = ['machine', 'human', 'ai'];

/** An entry placed in the whole timeline: its index in page order and the chip that index picks. */
export interface PlacedEntry extends YearEntry {
  index: number;
  glyph: (typeof CHIP_GLYPHS)[number];
  tone: ChipTone;
}

/** A run of entries sharing one year: the year pins while they scroll past. */
export interface YearGroup {
  year: string;
  entries: PlacedEntry[];
}

/**
 * Gather consecutive entries of one year into a group, keeping page order: a year that comes back later opens a new
 * group rather than pulling its entries forward. Throws on a blank date, which would pin an empty year.
 */
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
