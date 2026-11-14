/*
 * The pages `npm run episode:spec-preview` renders: a designer's fragment inside the Spec's own page, so what a
 * designer measures is what the user sees. Each page is built from the Spec template, through the assembler's own
 * functions (`itemMarkup`, `optionsMarkup`), and set to one render preset the way the page's toolbar sets it
 * (`data-preset` and `--preview-width` on `<html>`). Only the page's script is left out: the Options' mocks are moved
 * into the item's visual column here, all of them, each its own screenshot target.
 */
import { load } from 'cheerio';
import { TITLE_ANCHOR } from '../../shared/lib/title-anchor.pure.ts';
import { checkFragment, fragmentSlides } from './episode-spec-fragment.pure.ts';
import { itemMarkup, optionsMarkup, type Item } from './episode-spec-items.pure.ts';
import { fillIn, templateOf } from './episode-spec-template.pure.ts';

/** One render preset of the Spec calibration: the viewport an Option is rendered and measured at. */
export interface Preset {
  name: string;
  width: number;
  height: number;
  /** Whether text running past a mock's box at this preset fails the preview, or is only reported. */
  blocking: boolean;
}

/** One render of one Option: the Option's id at a preset. */
export interface Shot {
  id: string;
  preset: Preset;
}

/** The file stem of a Shot: its Option and its preset. */
export const shotName = ({ id, preset }: Shot): string => `${id}-${preset.name}`;

/** The height of a preset the calibration gives only a width: inspect-page's own default viewport height. */
const DEFAULT_HEIGHT = 800;

/** A preset's size as the report names it: `390px` for a width-only preset, `1080×1920` for a vertical one. */
function sizeOf({ width, height }: Preset): string {
  return height === DEFAULT_HEIGHT ? `${width}px` : `${width}×${height}`;
}

/**
 * The render presets in the Spec calibration's "Render presets" table, in table order. A row is a backticked preset
 * name, a size (`<width> px wide` or `<width> × <height>`) and what overflow does there (backticked `fails` or `reports`). The
 * calibration is the one source: the toolbar and this command both follow it. Throws when the section holds no
 * preset, so a moved heading fails loud.
 */
export function readPresets(calibration: string): Preset[] {
  const section = /^## Render presets\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(calibration)?.[1] ?? '';
  const row = /^\|\s*`([a-z]+)`\s*\|\s*(\d+)\s*(?:px wide|×\s*(\d+))[^|]*\|\s*`(fails|reports)`\s*\|/gm;
  const presets = [...section.matchAll(row)].map(([, name = '', width = '', height, overflow]): Preset => ({
    name,
    width: Number(width),
    height: height === undefined ? DEFAULT_HEIGHT : Number(height),
    blocking: overflow === 'fails',
  }));
  if (presets.length === 0)
    throw new Error('The Spec calibration has no "Render presets" table of `name` | size | overflow rows.');
  return presets;
}

/** Marks each element of a mock that runs past the mock's box, by `data-overflow`, once the page has laid out. */
const OVERFLOW_SCRIPT = `<script>
addEventListener('load', () => {
  for (const mock of document.querySelectorAll('.spec-stage[data-option] [data-spec="mock"]')) {
    const edge = mock.getBoundingClientRect().right;
    for (const element of mock.querySelectorAll('*')) {
      const rect = element.getBoundingClientRect();
      const wider = element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 1;
      if (wider || (rect.width > 0 && rect.right > edge + 1)) element.setAttribute('data-overflow', '');
    }
  }
});
</script>`;

/** The page's own script opens its navigation from this window width, as the template's head script does. */
const NAV_OPEN_WIDTH = 1800;

/** The narrowest window the page is built for (a laptop): a preset narrower than it is still viewed in this one. */
const LAPTOP_WINDOW = 1440;

/**
 * The window a preset is rendered in. The toolbar's presets set the width of the mock inside a window, so the window
 * is the preset's width or a laptop's, whichever is wider: a mobile preset gives a 390 px mock beside its rail.
 */
export function viewportOf({ width, height }: Preset): { width: number; height: number } {
  return { width: Math.max(width, LAPTOP_WINDOW), height };
}

/** The Option ids of a fragment, in order. */
export function optionIds(fragment: string): string[] {
  return [...fragment.matchAll(/<figure\b[^>]*data-option="([^"]+)"/g)].map((match) => match[1] ?? '');
}

/** Every Option of a fragment at every preset, Option by Option. */
export function shotsOf(fragment: string, presets: readonly Preset[]): Shot[] {
  return optionIds(fragment).flatMap((id) => presets.map((preset) => ({ id, preset })));
}

/** One Slide as the Spec lays it out: its item cloned from the template, every Option's mock moved into the visual. */
function slideMarkup(slug: string, html: string, templates: { item: string; option: string }): string {
  const number = Number(/data-option="(\d+)/.exec(html)?.[1] ?? '0');
  const isTitle = slug === TITLE_ANCHOR;
  const item: Item = {
    id: slug,
    role: isTitle ? 'title-slide' : 'slide',
    number: isTitle ? undefined : number,
    title: slug,
    options: optionsMarkup({ slug, html, template: templates.option, locked: undefined }),
    notePlaceholder: `Note on ${slug}`,
  };
  const $ = load(itemMarkup(item, templates.item), null, false);
  const stages = $('.spec-stages');
  $('.spec-options > [data-spec="option"]').each((_, figure) => {
    const stage = $(figure).children('.spec-stage').first();
    stage.attr('data-option', $(figure).attr('data-option') ?? '');
    stages.append(stage);
  });
  $('.spec-layout').addClass('is-split');
  return $.html();
}

/**
 * The preview page of a fragment at one preset: the Spec template's frame (its styles, shell and outline column)
 * with its toolbar, review form, scroll buttons and scripts left out, one item per Slide of the fragment, and the
 * preset set on `<html>` as the toolbar sets it.
 */
export function previewPage(template: string, fragment: string, preset: Preset): string {
  const $ = load(template);
  const templates = { item: templateOf($, 'item'), option: templateOf($, 'option') };
  $('template, script, [data-toolbar], .spec-scroll, #spec-review').remove();
  const slides = fragmentSlides(fragment).map(({ slug, html }) => slideMarkup(slug, html, templates));
  fillIn($, {
    'page-title': (element) => void element.text('Spec preview'),
    outline: () => undefined,
    kicker: 'Spec preview',
    heading: 'Spec preview',
    lede: undefined,
    intro: undefined,
    items: slides.join('\n'),
  });
  $('html').attr({
    'data-preset': preset.name,
    'data-nav': viewportOf(preset).width >= NAV_OPEN_WIDTH ? 'open' : 'closed',
    style: `--preview-width: ${preset.width}px`,
  });
  $('body').append(OVERFLOW_SCRIPT);
  return `${$.html()}\n`;
}

/** One rendered Option: its screenshot path and how many of its elements run past its mock's box. */
export interface Rendered {
  path: string;
  overflow: number;
}

/** What rendering one Shot came to: the render, or the error that stopped it. */
export interface Outcome {
  shot: Shot;
  result: Rendered | Error;
}

/** The slug whose Slide holds an Option: the nearest slide marker above its figure. */
function slideOf(fragment: string, id: string): string {
  const before = fragment.slice(0, fragment.indexOf(`data-option="${id}"`));
  return [...before.matchAll(/<!-- slide: ([a-z0-9-]+) -->/g)].at(-1)?.[1] ?? '';
}

/** What overflow measuring says about an Option at a preset: a line naming it, when any element overflows. */
function overflowLine(fragment: string, { id, preset }: Shot, count: number): string[] {
  if (count === 0) return [];
  const plural = count === 1 ? '' : 's';
  return [
    `Option ${id} of {#${slideOf(fragment, id)}} has text running past its box at ${preset.name} ${sizeOf(preset)} (${count} element${plural}): shorten it or let it wrap.`,
  ];
}

/**
 * What the command prints for a fragment and its renders: one `✖` line per contract violation, an overflow at a
 * preset the calibration marks `fails` or a render that did not happen; one `⚠` line per overflow elsewhere, which
 * only reports; then one `screenshot` line per rendered Option and preset. `failed` on any `✖` line.
 */
export function previewReport(fragment: string, outcomes: readonly Outcome[]): { lines: string[]; failed: boolean } {
  const violations = checkFragment(fragment);
  const notes: string[] = [];
  const shots: string[] = [];
  for (const { shot, result } of outcomes) {
    if (result instanceof Error) {
      violations.push(`Option ${shot.id} could not be rendered at ${shot.preset.name}: ${result.message}`);
      continue;
    }
    shots.push(`screenshot ${shot.id} ${shot.preset.name} ${result.path}`);
    (shot.preset.blocking ? violations : notes).push(...overflowLine(fragment, shot, result.overflow));
  }
  const lines = [...violations.map((line) => `✖ ${line}`), ...notes.map((line) => `⚠ ${line}`), ...shots];
  return { lines, failed: violations.length > 0 };
}
