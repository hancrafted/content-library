// decision: docs/decision-records/0011-episode-design-is-reviewed-as-a-static-html-spec.md
import { bodyLines } from './staging-markdown.pure.ts';

export interface Item {
  text: string;
  subs: string[];
}

export interface SourceSlide {
  title: string;
  slug: string;
  purpose?: string;
  visual: string[];
  notes?: Item[];
  voice?: Item[];
}

export interface SourceSection {
  title: string;
  slug: string;
  voice?: Item[];
  slides: SourceSlide[];
}

export interface Source {
  title: string;
  slug?: string;
  style?: string;
  sections: SourceSection[];
}

export const ORDERED_MARKER = /^\d+\. /;
const HEADING = /^(#{1,4}) (.*?)(?: \{#([a-z0-9-]+)\})?$/;
const BRIEF_ITEM = /^(?:\d+\. )?(?:\([AB]\) )?\*\*([^*]+)\*\* — (.*?)(?: _Visual:_ (.*?))?(?: _Research:_ [\d, ]+)?$/;

export function dossierSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const group = (match: RegExpExecArray, at: number): string => match[at] ?? '';

function continueItem(item: Item, text: string): void {
  if (item.subs.length > 0) item.subs[item.subs.length - 1] += ` ${text}`;
  else item.text += ` ${text}`;
}

function addLine(items: Item[], line: string): void {
  const item = ORDERED_MARKER.exec(line);
  const last = items.at(-1);
  if (item !== null) items.push({ text: line.slice(item[0].length), subs: [] });
  else if (last === undefined || line.trim() === '') return;
  else if (/^\s+- /.test(line)) last.subs.push(line.replace(/^\s+- /, ''));
  else continueItem(last, line.trim());
}

export function itemsOf(lines: readonly string[]): Item[] {
  const items: Item[] = [];
  for (const line of lines) addLine(items, line);
  return items;
}

function under(lines: readonly string[], heading: string): string[] {
  const start = lines.indexOf(heading);
  if (start === -1) return [];
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith('#'));
  return end === -1 ? rest : rest.slice(0, end);
}

const strip = (value: string): string => value.replace(/\.$/, '');

function briefSlide(line: string): SourceSlide | undefined {
  const match = BRIEF_ITEM.exec(line);
  if (match === null) return undefined;
  const text = group(match, 1);
  const visual = match[3];
  return {
    title: text,
    slug: dossierSlug(text),
    purpose: strip(group(match, 2)),
    visual: visual === undefined ? [] : [strip(visual)],
  };
}

function briefSections(lines: readonly string[]): SourceSection[] {
  const start = lines.indexOf('## Slides');
  const rest = start === -1 ? [] : lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith('## '));
  const sections: SourceSection[] = [];
  for (const line of end === -1 ? rest : rest.slice(0, end)) {
    if (line.startsWith('### ')) sections.push({ title: line.slice(4), slug: dossierSlug(line.slice(4)), slides: [] });
    else {
      const slide = briefSlide(line);
      if (slide !== undefined) sections.at(-1)?.slides.push(slide);
    }
  }
  return sections;
}

export function briefSource(brief: string): Source {
  const lines = bodyLines(brief);
  const style = under(lines, '## Style').join(' ').replace(/\s+/g, ' ').trim();
  return {
    title: lines.find((line) => line.startsWith('# '))?.slice(2) ?? 'Episode',
    style: style === '' ? undefined : style,
    sections: briefSections(lines),
  };
}

type Block = 'visual' | 'notes' | 'voice';
const BLOCKS: Record<string, Block> = { Visual: 'visual', 'Speaker notes': 'notes', 'Voice script': 'voice' };

interface Cursor {
  section?: SourceSection;
  slide?: SourceSlide;
  block?: Block;
  buffer: string[];
}

const paragraphsOf = (lines: readonly string[]): string[] =>
  lines
    .join('\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);

function flush(cursor: Cursor): void {
  const { section, slide, block, buffer } = cursor;
  const owner = slide ?? section;
  cursor.buffer = [];
  if (owner === undefined) return;
  if (block === 'voice') owner.voice = itemsOf(buffer);
  else if (slide === undefined) return;
  else if (block === 'visual') slide.visual = paragraphsOf(buffer);
  else if (block === 'notes') slide.notes = itemsOf(buffer);
}

interface Named {
  text: string;
  slug: string | undefined;
}

function openSection(source: Source, cursor: Cursor, { text, slug }: Named): void {
  cursor.slide = undefined;
  cursor.section = slug === undefined ? undefined : { title: text, slug, slides: [] };
  if (cursor.section !== undefined) source.sections.push(cursor.section);
}

function openSlide(cursor: Cursor, { text, slug }: Named): void {
  cursor.slide = { title: text, slug: slug ?? dossierSlug(text), visual: [] };
  cursor.section?.slides.push(cursor.slide);
}

function openHeading(source: Source, cursor: Cursor, heading: RegExpExecArray): void {
  const level = group(heading, 1).length;
  const [text, slug] = [group(heading, 2), heading[3]];
  cursor.block = undefined;
  if (level === 1) [source.title, source.slug] = [text, slug];
  else if (level === 2) openSection(source, cursor, { text, slug });
  else if (level === 3) openSlide(cursor, { text, slug });
  else if (level === 4) cursor.block = BLOCKS[text];
}

export function dossierSource(dossier: string): Source {
  const source: Source = { title: 'Episode', sections: [] };
  const cursor: Cursor = { buffer: [] };
  for (const line of bodyLines(dossier)) {
    const heading = HEADING.exec(line);
    if (heading === null) {
      if (cursor.block !== undefined) cursor.buffer.push(line);
    } else {
      flush(cursor);
      openHeading(source, cursor, heading);
    }
  }
  flush(cursor);
  return source;
}

export function mergedSource(brief: Source, dossier: Source): Source {
  const purposes = brief.sections.flatMap(({ slides }) => slides.map(({ purpose }) => purpose));
  const briefVisuals = brief.sections.flatMap(({ slides }) => slides.map(({ visual }) => visual));
  let index = 0;
  return {
    ...dossier,
    title: brief.title,
    style: brief.style,
    sections: dossier.sections.map((section) => ({
      ...section,
      slides: section.slides.map((slide) => {
        const at = index++;
        return {
          ...slide,
          purpose: purposes[at],
          visual: slide.visual.length > 0 ? slide.visual : (briefVisuals[at] ?? []),
        };
      }),
    })),
  };
}
