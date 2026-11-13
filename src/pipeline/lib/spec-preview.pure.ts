/*
 * The page `npm run episode:spec-preview` renders: a designer's fragment inside the Spec's own frame, so what a
 * designer measures is what the user sees. The shell is the Spec's (`spec-shell` with its outline column, `spec-page`),
 * so the Option stage has the Spec's exact width at every viewport; only the tab script is left out, which lets
 * every Option show, stacked, each its own screenshot target.
 */
import { checkFragment, fragmentSlides, pickBox } from './episode-spec-fragment.pure.ts';

/** One render preset of the Spec calibration: the viewport an Option is rendered and measured at. */
export interface Preset {
  name: string;
  width: number;
  height: number;
}

/** The height of a preset the calibration gives only a width: inspect-page's own default viewport height. */
const DEFAULT_HEIGHT = 800;

/** A preset's size as the report names it: `390px` for a width-only preset, `1080×1920` for a vertical one. */
function sizeOf({ width, height }: Preset): string {
  return height === DEFAULT_HEIGHT ? `${width}px` : `${width}×${height}`;
}

/**
 * The render presets in the Spec calibration's "Render presets" table, in table order. A row is a backticked preset
 * name and a size, either `<width> px wide` or `<width> × <height>`. The calibration is the one source: the toolbar
 * and this command both follow it. Throws when the section holds no preset, so a moved heading fails loud.
 */
export function readPresets(calibration: string): Preset[] {
  const section = /^## Render presets\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(calibration)?.[1] ?? '';
  const presets = [...section.matchAll(/^\|\s*`([a-z]+)`\s*\|\s*(\d+)\s*(?:px wide|×\s*(\d+))/gm)].map(
    ([, name = '', width = '', height]): Preset => ({
      name,
      width: Number(width),
      height: height === undefined ? DEFAULT_HEIGHT : Number(height),
    }),
  );
  if (presets.length === 0)
    throw new Error('The Spec calibration has no "Render presets" table of `name` | size rows.');
  return presets;
}

/** Marks each element of an Option that runs past the Option's box, by `data-overflow`, once the page has laid out. */
const OVERFLOW_SCRIPT = `<script>
addEventListener('load', () => {
  for (const figure of document.querySelectorAll('[data-spec="option"]')) {
    const edge = figure.getBoundingClientRect().right;
    for (const element of figure.querySelectorAll('*')) {
      const rect = element.getBoundingClientRect();
      const wider = element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 1;
      if (wider || (rect.width > 0 && rect.right > edge + 1)) element.setAttribute('data-overflow', '');
    }
  }
});
</script>`;

/** The frame with its tab script cut and its body left open for the page. */
function frameHead(frame: string): string {
  return frame.replace(/<script>[\s\S]*?<\/script>\s*/, '').replace(/\s*<\/head>[\s\S]*$/, '\n  </head>');
}

/** One Slide as the Spec lays it out, its Options stacked under the head. */
function slideMarkup(slug: string, html: string): string {
  const withBoxes = html.replace(
    /(<figure\b[^>]*data-option="([^"]+)"[^>]*>)/g,
    (tag, _all, id: string) => `${tag}${pickBox(slug, id)}`,
  );
  const number = /data-option="(\d+)/.exec(html)?.[1] ?? '0';
  const attrs = slug === 'top' ? 'data-spec="title-slide"' : `data-spec="slide" data-number="${number}"`;
  return `<article ${attrs} id="${slug}">
  <header class="spec-slide-head"><span class="spec-number">${number}</span><h3>${slug}</h3></header>
  <div class="spec-options">${withBoxes}</div>
</article>`;
}

/** The Option ids of a fragment, in order. */
export function optionIds(fragment: string): string[] {
  return [...fragment.matchAll(/<figure\b[^>]*data-option="([^"]+)"/g)].map((match) => match[1] ?? '');
}

/** The full preview page for a fragment, given the Spec frame. */
export function previewPage(frame: string, fragment: string): string {
  const slides = fragmentSlides(fragment).map(({ slug, html }) => slideMarkup(slug, html));
  return `${frameHead(frame)}
  <body>
    <div class="spec-shell">
      <nav class="spec-outline" aria-label="Slides"></nav>
      <main class="spec-page">
${slides.join('\n')}
      </main>
    </div>
    ${OVERFLOW_SCRIPT}
  </body>
</html>
`;
}

/** One rendered Option: its screenshot path and how many of its elements run past its box. */
export interface Rendered {
  path: string;
  overflow: number;
}

/** Renders one Option by id at one preset; throws when it cannot. */
export type Render = (id: string, preset: Preset) => Rendered;

/** The slug whose Slide holds an Option: the nearest slide marker above its figure. */
function slideOf(fragment: string, id: string): string {
  const before = fragment.slice(0, fragment.indexOf(`data-option="${id}"`));
  return [...before.matchAll(/<!-- slide: ([a-z0-9-]+) -->/g)].at(-1)?.[1] ?? '';
}

/** What overflow measuring says about an Option at a preset, as a violation when it overflows. */
function overflowViolation(fragment: string, at: { id: string; preset: Preset }, count: number): string[] {
  const { id, preset } = at;
  if (count === 0) return [];
  const plural = count === 1 ? '' : 's';
  return [
    `Option ${id} of {#${slideOf(fragment, id)}} has text running past its box at ${preset.name} ${sizeOf(preset)} (${count} element${plural}): shorten it or let it wrap.`,
  ];
}

/**
 * What the command prints for a fragment: one `✖` line per contract or overflow violation, then one `screenshot`
 * line per rendered Option and preset. Every Option is rendered at every preset, violations or not; `failed` on any
 * violation.
 */
export function previewReport(
  fragment: string,
  presets: Preset[],
  render: Render,
): { lines: string[]; failed: boolean } {
  const violations = checkFragment(fragment);
  const shots: string[] = [];
  for (const id of optionIds(fragment)) {
    for (const preset of presets) {
      try {
        const rendered = render(id, preset);
        shots.push(`screenshot ${id} ${preset.name} ${rendered.path}`);
        violations.push(...overflowViolation(fragment, { id, preset }, rendered.overflow));
      } catch (error) {
        violations.push(`Option ${id} could not be rendered at ${preset.name}: ${(error as Error).message}`);
      }
    }
  }
  return { lines: [...violations.map((line) => `✖ ${line}`), ...shots], failed: violations.length > 0 };
}
