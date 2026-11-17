// decision: docs/decision-records/0011-episode-design-is-reviewed-as-a-static-html-spec.md
import { load, type CheerioAPI } from 'cheerio';
import { type Selection } from './episode-spec-slide.pure.ts';

export type Slot = string | ((element: Selection) => void) | undefined;

export function templateOf($: CheerioAPI, name: string): string {
  const template = $(`template[data-template="${name}"]`).first();
  if (template.length === 0) throw new Error(`The Spec template has no <template data-template="${name}">.`);
  return template.html()?.trim() ?? '';
}

export function fillIn($: CheerioAPI, slots: Readonly<Record<string, Slot>>): void {
  $('[data-slot]').each((_, node) => {
    const element = $(node) as Selection;
    const name = element.attr('data-slot') ?? '';
    if (!Object.hasOwn(slots, name))
      throw new Error(`The Spec template names the slot "${name}", which the assembler does not fill.`);
    const value = slots[name];
    element.removeAttr('data-slot');
    if (value === undefined || value === '') element.remove();
    else if (typeof value === 'string') element.html(value);
    else value(element);
  });
}

export function filledMarkup(
  markup: string,
  slots: Readonly<Record<string, Slot>>,
  finish: (root: Selection) => void,
): string {
  const $ = load(markup, null, false);
  fillIn($, slots);
  finish($.root().children().first() as Selection);
  return $.html();
}
