// decision: docs/adr/0011-episode-design-is-reviewed-as-a-static-html-spec.md
import { type CheerioAPI } from 'cheerio';
import { SLIDE } from './episode-spec-page.pure.ts';
import { type Element, type Selection } from './episode-spec-slide.pure.ts';
import { unless } from './finding.pure.ts';

function ownerOf(list: Selection): string {
  return list.closest(`${SLIDE}, section[id]`).attr('id') ?? 'spec';
}

function ownText($: CheerioAPI, item: Element, withoutTitle: boolean): string {
  const copy = $(item).clone();
  copy.find('ul, ol').remove();
  if (withoutTitle) copy.children('strong').first().remove();
  return copy.text().replace(/\s+/g, ' ').trim();
}

function itemsOf($: CheerioAPI, selector: `ol[${string}]`): { owner: string; item: Element; title: string }[] {
  return $(selector)
    .toArray()
    .flatMap((list) =>
      $(list)
        .children('li')
        .toArray()
        .map((item) => ({ owner: ownerOf($(list)), item, title: $(item).children('strong').first().text().trim() })),
    );
}

export function checkVoiceScripts($: CheerioAPI): string[] {
  return itemsOf($, 'ol[data-spec="voice-script"]').flatMap(({ owner, item, title }) => {
    if (title === '') return [`A Voice script item of {#${owner}} has no <strong> title: "${ownText($, item, false)}"`];
    const text = ownText($, item, true).replace(/^[—–-]\s*/, '');
    return unless(text !== '', `The Voice script item "${title}" of {#${owner}} has no text after its title.`);
  });
}

const CITATION = /\[(\d+)\]/g;

export function checkCitations($: CheerioAPI): string[] {
  return itemsOf($, 'ol[data-spec="speaker-notes"]').flatMap(({ owner, item, title }) => {
    const sources = $(item)
      .find('[data-source]')
      .toArray()
      .map((source) => $(source).attr('data-source'));
    return [...ownText($, item, false).matchAll(CITATION)]
      .filter(([, n]) => !sources.includes(n))
      .map(
        ([citation]) =>
          `The Speaker note "${title}" of {#${owner}} cites ${citation}, which resolves to no source nested in it.`,
      );
  });
}
