/*
 * The Spec template's slots (design-ADR 0011): `skills/new-episode/assets/spec-template.html` is a page frame with
 * `data-slot` elements and two `<template data-template="item|option">` elements, and the assembler clones and fills
 * them. A slot's value is markup (its element's content is replaced), a function (the element is handed over, to set
 * attributes) or `undefined` (the element is dropped). A slot the assembler does not know is a template the skill
 * wrote for another assembler, so it throws.
 */

import { load, type CheerioAPI } from 'cheerio';
import { type Selection } from './episode-spec-slide.pure.ts';

export type Slot = string | ((element: Selection) => void) | undefined;

/** The markup of the `<template data-template="name">` in a page, or a throw naming the missing one. */
export function templateOf($: CheerioAPI, name: string): string {
  const template = $(`template[data-template="${name}"]`).first();
  if (template.length === 0) throw new Error(`The Spec template has no <template data-template="${name}">.`);
  return template.html()?.trim() ?? '';
}

/** Fills the `data-slot` elements of a parsed page or fragment, in place. */
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

/** A markup fragment with its slots filled; its one root element is handed to `finish` for attributes, then printed. */
export function cloned(
  markup: string,
  slots: Readonly<Record<string, Slot>>,
  finish: (root: Selection) => void = () => undefined,
): string {
  const $ = load(markup, null, false);
  fillIn($, slots);
  finish($.root().children().first() as Selection);
  return $.html();
}
