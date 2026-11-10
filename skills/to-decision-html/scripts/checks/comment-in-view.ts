// While a reviewer types a long comment into a field inside an item, at least half of the visual it is about stays
// in the viewport. The visual is the largest [data-visual] in the field's Option, else in its item; without one,
// the largest svg, img, canvas, video or iframe there. A field whose item has no visual is skipped.
import type { Page } from '@playwright/test';
import type { Check } from '../grader/check.ts';
import { describeElement, type ElementFacts } from '../grader/element.pure.ts';
import { inPage, type Kit } from '../grader/in-page.ts';
import { shownShare, type Rect, type Viewport } from '../grader/viewport.pure.ts';

interface Field {
  readonly facts: ElementFacts;
  /** Its visual's box after typing, or null when its item has no visual. */
  readonly visual: Rect | null;
}

interface Observation {
  readonly viewport: Viewport;
  readonly fields: readonly Field[];
}

const FIELDS = '[data-item] textarea';
const MIN_SHOWN = 0.5;
/** A dictated comment: long enough to grow a field that grows with its text, with non-ASCII text. */
const COMMENT = Array.from({ length: 12 }, (_, line) => `Zeile ${line + 1}: die Grafik oben zeigt „genau“ das.`).join(
  '\n',
);

/** Runs in the page: the field's facts and its visual's box. */
function measure(kit: Kit, { selector, index }: { selector: string; index: number }): Field {
  const field = document.querySelectorAll(selector)[index];
  const area = (element: Element) => element.getBoundingClientRect().width * element.getBoundingClientRect().height;
  const largest = (scope: Element | null) => {
    const marked = [...(scope?.querySelectorAll('[data-visual]') ?? [])];
    // An icon inside a button or label is a control's glyph, not the visual under discussion.
    const drawn = [...(scope?.querySelectorAll('svg, img, canvas, video, iframe') ?? [])].filter(
      (element) => !element.closest('button, label'),
    );
    const candidates = (marked.length > 0 ? marked : drawn).filter((element) => area(element) > 0);
    return candidates.sort((a, b) => area(b) - area(a))[0] ?? null;
  };
  const visual = largest(field.closest('[data-option]')) ?? largest(field.closest('[data-item]'));
  return { facts: kit.facts(field), visual: (visual?.getBoundingClientRect().toJSON() as Rect | undefined) ?? null };
}

/** Types the comment the way a reviewer does, from the top of the page: click into the field, then type. */
async function commentOn(page: Page, index: number): Promise<Field> {
  const field = page.locator(FIELDS).nth(index);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await field.click();
  await page.keyboard.insertText(COMMENT);
  const measured = await inPage(page, measure, { selector: FIELDS, index });
  await field.fill('');
  return measured;
}

export const check: Check<Observation> = {
  id: 'comment-in-view',
  summary: 'While a long comment is typed into an item or Option field, at least half of its visual stays in view.',
  async observe({ page }) {
    const viewport = page.viewportSize() ?? { width: 0, height: 0 };
    const fields: Field[] = [];
    const all = page.locator(FIELDS);
    for (let index = 0; index < (await all.count()); index++)
      if (await all.nth(index).isVisible()) fields.push(await commentOn(page, index));
    return { viewport, fields };
  },
  judge: ({ viewport, fields }) =>
    fields
      .filter((field): field is Field & { visual: Rect } => field.visual !== null)
      .map(({ facts, visual }) => ({ facts, share: shownShare(visual, viewport) }))
      .filter(({ share }) => share < MIN_SHOWN)
      .map(
        ({ facts, share }) =>
          `while ${describeElement(facts)} has focus, ${Math.floor(share * 100)}% of its visual is in view; keep at least half of it beside the comment`,
      ),
};
