import type { CheerioAPI } from 'cheerio';

interface DomNode {
  readonly type: string;
  readonly data?: string;
  readonly attribs?: Readonly<Record<string, string>>;
  readonly children?: readonly DomNode[];
}

export interface TextRegion {
  readonly id: string;
  readonly text: string;
}

export interface EpisodeText {
  readonly title: string;
  readonly description: string;
  readonly toc: string;
  readonly slides: readonly TextRegion[];
  readonly notes: readonly TextRegion[];
  readonly script: readonly TextRegion[];
}

const CHROME_ACTIONS_ADDED_AFTER_THE_MIGRATION_CAPTURE = '[data-toc-actions]';

function textOf(element: unknown): string {
  const parts: string[] = [];
  const walk = (node: DomNode): void => {
    if (node.type === 'text') parts.push(node.data ?? '');
    const typedHeaderRepeatingHiddenTextByCharacter = node.attribs?.['data-typed'] !== undefined;
    if (node.type === 'tag' && !typedHeaderRepeatingHiddenTextByCharacter) node.children?.forEach(walk);
  };
  walk(element as DomNode);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function regions($: CheerioAPI, selector: string, idAttribute: string): TextRegion[] {
  return $(selector)
    .toArray()
    .map((element) => ({ id: $(element).attr(idAttribute) ?? '', text: textOf(element) }));
}

export function episodeText($: CheerioAPI): EpisodeText {
  return {
    title: $('head > title').text(),
    description: $('head > meta[name="description"]').attr('content') ?? '',
    toc: $('[data-slot="toc"]')
      .toArray()
      .map((toc) => {
        const outline = $(toc).clone();
        outline.find(CHROME_ACTIONS_ADDED_AFTER_THE_MIGRATION_CAPTURE).remove();
        return textOf(outline.get(0));
      })
      .join(' '),
    slides: regions($, '[data-slot="slides"] [data-slide]', 'id'),
    notes: regions($, '#context-panel-notes [data-context-for]', 'data-context-for'),
    script: regions($, '#context-panel-script [data-context-for]', 'data-context-for'),
  };
}
