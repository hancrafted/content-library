/*
 * The Spec's items and Options cloned from the Spec template (design-ADR 0011): an item is a Slide or the Title
 * slide, an Option one of the designers' fragment figures. Each is filled into its `<template>`'s slots and given the
 * attributes the Spec calibration lists (`skills/new-episode/references/spec-calibration.md`, "Template and slots").
 */

import { load } from 'cheerio';
import { escape } from './episode-spec-assemble-words.pure.ts';
import { isRecommended, type Selection } from './episode-spec-slide.pure.ts';
import { filledMarkup } from './episode-spec-template.pure.ts';

/** The fidelity every Spec item is drawn at (the Spec calibration): a real-content mock. */
const FIDELITY = 'mock';

/** The two templates of the page, as markup. */
export interface Templates {
  item: string;
  option: string;
}

/** An Option figure's attributes the template sets itself; the rest of the figure's attributes carry over. */
const OWN_ATTRIBUTES = /^data-(spec|option|recommended|picked)$/;

/** The parts of a fragment's figure the Option template has a slot for: its stage, caption and build notes. */
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

/** One Option cloned from the template: the fragment's figure supplies its attributes, mock, caption and build notes. */
function optionMarkup(
  figure: Selection,
  { slug, template, locked }: { slug: string; template: string; locked: boolean },
): string {
  const id = figure.attr('data-option') ?? '';
  const { stage, caption, notes } = optionParts(figure);
  const pick = (box: Selection) => {
    box.attr({ name: `pick:${slug}`, value: id });
    if (locked) box.attr('checked', '');
  };
  return filledMarkup(template, { stage, caption, 'build-notes': notes, id: escape(id), pick }, (root) => {
    const kept = Object.entries(figure.attr() ?? {}).filter(([name]) => !OWN_ATTRIBUTES.test(name));
    root.attr(Object.fromEntries(kept));
    root.attr('data-option', id);
    root.attr('data-recommended', String(isRecommended(figure)));
    if (locked) root.attr('data-picked', '');
  });
}

/** What one Slide's Options are cloned from: its slug, its fragment's Option markup, the template and the locked Option. */
interface OptionsSource {
  slug: string;
  html: string;
  template: string;
  locked: string | undefined;
}

/** One Slide's Options cloned from the Option template, the locked Option marked picked and ticked. */
export function optionsMarkup({ slug, html, template, locked }: OptionsSource): string {
  const $ = load(html, null, false);
  const figures = $('figure[data-spec="option"]')
    .toArray()
    .map((figure) => $(figure) as Selection);
  const lock = figures.some((figure) => figure.attr('data-option') === locked) ? locked : undefined;
  return figures
    .map((figure) => optionMarkup(figure, { slug, template, locked: figure.attr('data-option') === lock }))
    .join('\n');
}

/** What one item (a Slide or the Title slide) is cloned from: its id, header, words and, once it has them, Options. */
export interface Item {
  id: string;
  role: 'slide' | 'title-slide';
  /** The Slide's number; the Title slide has none and reads 0. */
  number?: number;
  title: string;
  purpose?: string;
  words?: string;
  options?: string;
  notePlaceholder: string;
}

/** One item cloned from the item template: its slots filled, `data-item` and `data-fidelity` set. */
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
