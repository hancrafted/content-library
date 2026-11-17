// decision: docs/decision-records/0011-episode-design-is-reviewed-as-a-static-html-spec.md
import { load } from 'cheerio';
import { escape } from './episode-spec-assemble-words.pure.ts';
import { isRecommended, type Selection } from './episode-spec-slide.pure.ts';
import { filledMarkup } from './episode-spec-template.pure.ts';

const FIDELITY = 'mock';

export interface Templates {
  item: string;
  option: string;
}

const OWN_ATTRIBUTES = /^data-(spec|option|recommended|picked)$/;

function optionParts(figure: Selection) {
  const $ = load('', null, false);
  const caption = figure.children('figcaption').first();
  const notes = figure.children('[data-spec="build-notes"]').first();
  const stage = figure
    .children()
    .not(caption)
    .not(notes)
    .toArray()
    .map((child) => $.html(child))
    .join('\n');
  return { stage, caption: caption.html() ?? undefined, notes: notes.length === 0 ? undefined : $.html(notes) };
}

type PickState = 'locked' | 'default' | 'none';

function pickStateOf(figure: Selection, lock: string | undefined): PickState {
  if (lock === undefined) return isRecommended(figure) ? 'default' : 'none';
  return figure.attr('data-option') === lock ? 'locked' : 'none';
}

function optionMarkup(
  figure: Selection,
  { slug, template, state }: { slug: string; template: string; state: PickState },
): string {
  const id = figure.attr('data-option') ?? '';
  const { stage, caption, notes } = optionParts(figure);
  const pick = (box: Selection) => {
    box.attr({ name: `pick:${slug}`, value: id });
    if (state !== 'none') box.attr('checked', '');
  };
  return filledMarkup(template, { stage, caption, 'build-notes': notes, id: escape(id), pick }, (root) => {
    const kept = Object.entries(figure.attr() ?? {}).filter(([name]) => !OWN_ATTRIBUTES.test(name));
    root.attr(Object.fromEntries(kept));
    root.attr('data-option', id);
    root.attr('data-recommended', String(isRecommended(figure)));
    if (state === 'locked') root.attr('data-picked', '');
  });
}

interface OptionsSource {
  slug: string;
  html: string;
  template: string;
  locked: string | undefined;
}

export function optionsMarkup({ slug, html, template, locked }: OptionsSource): string {
  const $ = load(html, null, false);
  const figures = $('figure[data-spec="option"]')
    .toArray()
    .map((figure) => $(figure) as Selection);
  const lock = figures.some((figure) => figure.attr('data-option') === locked) ? locked : undefined;
  return figures.map((figure) => optionMarkup(figure, { slug, template, state: pickStateOf(figure, lock) })).join('\n');
}

export interface Item {
  id: string;
  role: 'slide' | 'title-slide';
  number?: number;
  title: string;
  purpose?: string;
  words?: string;
  options?: string;
  notePlaceholder: string;
}

export function itemMarkup(item: Item, template: string): string {
  const name = `note:${item.id}`;
  const note = (field: Selection) =>
    void field.attr({ name, placeholder: item.notePlaceholder, 'aria-label': item.notePlaceholder });
  const slots = {
    number: String(item.number ?? 0),
    title: item.title,
    purpose: item.purpose,
    words: item.words,
    options: item.options,
    note: item.options === undefined ? undefined : note,
  };
  return filledMarkup(template, slots, (root) => {
    root.attr({ 'data-spec': item.role, id: item.id, 'data-item': item.id, 'data-fidelity': FIDELITY });
    if (item.number !== undefined) root.attr('data-number', String(item.number));
  });
}
