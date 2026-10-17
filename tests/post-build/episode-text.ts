// The text an Episode page shows a reader, region by region, read from the
// exported HTML: what the Self-contained Slides migration (#51) must leave
// unchanged. Text nodes are joined by one space, so a word boundary the markup
// drew still counts; markup, classes and ids generated at render do not.

import type { CheerioAPI } from 'cheerio';

/** The least of a parsed node the walk reads: text nodes carry `data`, elements `children` and `attribs`. */
interface DomNode {
  readonly type: string;
  readonly data?: string;
  readonly attribs?: Readonly<Record<string, string>>;
  readonly children?: readonly DomNode[];
}

/** One region's text, keyed by the anchor or slot it belongs to. */
export interface TextRegion {
  readonly id: string;
  readonly text: string;
}

/** Everything an Episode page says, in page order. */
export interface EpisodeText {
  readonly title: string;
  readonly description: string;
  readonly toc: string;
  readonly slides: readonly TextRegion[];
  readonly notes: readonly TextRegion[];
  readonly script: readonly TextRegion[];
}

function textOf(element: unknown): string {
  const parts: string[] = [];
  const walk = (node: DomNode): void => {
    if (node.type === 'text') parts.push(node.data ?? '');
    // A typed Slide header repeats its visually hidden text character by character: the hidden copy counts once.
    if (node.type === 'tag' && node.attribs?.['data-typed'] === undefined) node.children?.forEach(walk);
  };
  walk(element as DomNode);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function regions($: CheerioAPI, selector: string, idAttribute: string): TextRegion[] {
  return $(selector)
    .toArray()
    .map((element) => ({ id: $(element).attr(idAttribute) ?? '', text: textOf(element) }));
}

/** The reader-facing text of one exported Episode page. */
export function episodeText($: CheerioAPI): EpisodeText {
  return {
    title: $('head > title').text(),
    description: $('head > meta[name="description"]').attr('content') ?? '',
    toc: $('[data-slot="toc"]')
      .toArray()
      .map((toc) => textOf(toc))
      .join(' '),
    slides: regions($, '[data-slot="slides"] [data-slide]', 'id'),
    notes: regions($, '#context-panel-notes [data-context-for]', 'data-context-for'),
    script: regions($, '#context-panel-script [data-context-for]', 'data-context-for'),
  };
}
