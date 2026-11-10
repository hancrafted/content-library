// Browser-side helpers the layout checks share. Playwright ships a function to the page as its source text, so any
// helper it calls must travel with it: `inPage` sends these helpers along as the function's first argument.
import type { Page } from '@playwright/test';
import type { ElementFacts } from './element.pure.ts';

/** Runs in the page: what describeElement needs to name the element in a problem. */
function facts(element: Element): ElementFacts {
  const label = (element as HTMLInputElement).labels?.[0]?.textContent;
  return {
    tag: element.tagName.toLowerCase(),
    id: element.id,
    item: element.closest('[data-item]')?.getAttribute('data-item') ?? null,
    text: label ?? element.textContent ?? '',
  };
}

/** Runs in the page: any CSS colour as sRGB red, green and blue 0–255 and alpha 0–1, oklch and color() included. */
function rgba(color: string): number[] {
  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
  return [red, green, blue, alpha / 255];
}

export interface Kit {
  facts: typeof facts;
  rgba: typeof rgba;
}

/** Runs `fn(kit, arg)` in the page; `arg` must survive JSON. */
export function inPage<A, R>(page: Page, fn: (kit: Kit, arg: A) => R, arg: A): Promise<R> {
  const kit = `{ facts: ${facts.toString()}, rgba: ${rgba.toString()} }`;
  return page.evaluate(`(${fn.toString()})(${kit}, ${JSON.stringify(arg) ?? 'undefined'})`) as Promise<R>;
}
