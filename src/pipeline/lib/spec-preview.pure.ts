import { load } from 'cheerio';
import { TITLE_ANCHOR } from '../../shared/lib/title-anchor.pure.ts';
import { checkFragment, fragmentSlides } from './episode-spec-fragment.pure.ts';
import { itemMarkup, optionsMarkup, type Item } from './episode-spec-items.pure.ts';
import { fillIn, templateOf } from './episode-spec-template.pure.ts';

export interface Preset {
  name: string;
  width: number;
  height: number;
  blocking: boolean;
}

export interface Shot {
  id: string;
  preset: Preset;
}

export const shotName = ({ id, preset }: Shot): string => `${id}-${preset.name}`;

const DEFAULT_HEIGHT = 800;

function sizeOf({ width, height }: Preset): string {
  return height === DEFAULT_HEIGHT ? `${width}px` : `${width}×${height}`;
}

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

export interface ToolbarConfig {
  navOpenWidth: number;
  toolbarHeight: number;
  fitMargin: number;
  'fitRoomMin': number;
}

const TOOLBAR_NUMBERS: readonly (keyof ToolbarConfig)[] = ['navOpenWidth', 'toolbarHeight', 'fitMargin', 'fitRoomMin'];

export function toolbarConfigOf(template: string): ToolbarConfig {
  const text = load(template)('script[data-toolbar-config]').first().text();
  const parsed: Partial<Record<keyof ToolbarConfig, unknown>> = text.trim() === '' ? {} : JSON.parse(text);
  const bad = TOOLBAR_NUMBERS.filter((name) => typeof parsed[name] !== 'number' || !(parsed[name] > 0));
  if (bad.length > 0)
    throw new Error(`The Spec template's <script data-toolbar-config> lacks a positive number for ${bad.join(', ')}.`);
  return parsed as unknown as ToolbarConfig;
}

const LAPTOP_WINDOW = 1440;

const LAPTOP_HEIGHT = 900;

const isFixed = ({ height }: Preset): boolean => height !== DEFAULT_HEIGHT;

export function viewportOf(preset: Preset): { width: number; height: number } {
  return {
    width: Math.max(preset.width, LAPTOP_WINDOW),
    height: isFixed(preset) ? LAPTOP_HEIGHT : preset.height,
  };
}

function scaleOf(preset: Preset, config: ToolbarConfig): number {
  const room = Math.max(viewportOf(preset).height - config.toolbarHeight - 2 * config.fitMargin, config.fitRoomMin);
  return Math.min(1, Math.round((room / preset.height) * 10000) / 10000);
}

function presetStyle(preset: Preset, config: ToolbarConfig): string {
  const base = `--toolbar-h: ${config.toolbarHeight}px; --preview-width: ${preset.width}px`;
  if (!isFixed(preset)) return base;
  return `${base}; --preview-height: ${preset.height}px; --preview-scale: ${scaleOf(preset, config)}`;
}

export function optionIds(fragment: string): string[] {
  return [...fragment.matchAll(/<figure\b[^>]*data-option="([^"]+)"/g)].map((match) => match[1] ?? '');
}

export function shotsOf(fragment: string, presets: readonly Preset[]): Shot[] {
  return optionIds(fragment).flatMap((id) => presets.map((preset) => ({ id, preset })));
}

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

export function previewPage(template: string, fragment: string, preset: Preset): string {
  const $ = load(template);
  const config = toolbarConfigOf(template);
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
    'data-nav': viewportOf(preset).width >= config.navOpenWidth ? 'open' : 'closed',
    style: presetStyle(preset, config),
  });
  if (isFixed(preset)) $('html').attr('data-preview-fixed', '');
  $('body').append(OVERFLOW_SCRIPT);
  return `${$.html()}\n`;
}

export interface Rendered {
  path: string;
  overflow: number;
}

export interface Outcome {
  shot: Shot;
  result: Rendered | Error;
}

function slideOf(fragment: string, id: string): string {
  const before = fragment.slice(0, fragment.indexOf(`data-option="${id}"`));
  return [...before.matchAll(/<!-- slide: ([a-z0-9-]+) -->/g)].at(-1)?.[1] ?? '';
}

function overflowLine(fragment: string, { id, preset }: Shot, count: number): string[] {
  if (count === 0) return [];
  const plural = count === 1 ? '' : 's';
  return [
    `Option ${id} of {#${slideOf(fragment, id)}} has text running past its box at ${preset.name} ${sizeOf(preset)} (${count} element${plural}): shorten it or let it wrap.`,
  ];
}

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
