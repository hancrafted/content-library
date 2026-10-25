import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The browser lane (`npm run test:browser`): the Spec review form's own script in a real browser, against ARCH-003
// §1.1. What a saved review writes is unit-tested in `spec-feedback.pure.test.ts`; this proves which notes the page
// asks for before it posts: a Slide with no tick needs one, a reused Slide none, and a flip to adapt one again.

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const ASSET = readFileSync(path.join(ROOT, 'skills/new-episode/assets/spec-review.html'), 'utf8');

const PAGE = `<!doctype html><html><head><script type="application/json" id="spec-meta">{"title":"Budget"}</script></head>
<body>
<article data-spec="slide" id="spent">
  <input type="checkbox" form="spec-review" name="pick:spent" value="1a">
  <textarea form="spec-review" name="note:spent"></textarea>
</article>
<article data-spec="slide" id="quiet" data-reused="lost-in-the-middle">
  <select form="spec-review" name="plan:quiet" data-current="reuse">
    <option value="reuse" selected>reuse</option><option value="adapt">adapt</option><option value="new">new</option>
  </select>
  <textarea form="spec-review" name="note:quiet"></textarea>
</article>
${ASSET}
</body></html>`;

/** The page served from its own origin, so the form's script can keep its draft in localStorage. */
async function open(page: Page): Promise<void> {
  await page.route('http://spec.test/', (route) => route.fulfill({ contentType: 'text/html', body: PAGE }));
  await page.goto('http://spec.test/');
}

test.describe('success cases', () => {
  test('asks no note of a reused Slide Han leaves as it is', async ({ page }) => {
    // ARRANGE
    await open(page);
    // ACT
    const note = page.locator('textarea[name="note:quiet"]');
    // ASSERT
    await expect(note).toHaveJSProperty('required', false);
  });

  test('asks a note of a reused Slide once Han flips it to adapt', async ({ page }) => {
    // ARRANGE
    await open(page);
    // ACT
    await page.selectOption('select[name="plan:quiet"]', 'adapt');
    // ASSERT
    await expect(page.locator('textarea[name="note:quiet"]')).toHaveJSProperty('required', true);
  });

  test('asks no note of a Slide once an Option is ticked', async ({ page }) => {
    // ARRANGE
    await open(page);
    // ACT
    await page.check('input[name="pick:spent"]');
    // ASSERT
    await expect(page.locator('textarea[name="note:spent"]')).toHaveJSProperty('required', false);
  });
});

test.describe('failure cases', () => {
  test('asks a note of a Slide with no tick', async ({ page }) => {
    // ARRANGE
    await open(page);
    // ACT
    const note = page.locator('textarea[name="note:spent"]');
    // ASSERT
    await expect(note).toHaveJSProperty('required', true);
  });
});

test.describe('edge cases', () => {
  test('asks no note of a reused Slide flipped to new', async ({ page }) => {
    // ARRANGE
    await open(page);
    // ACT
    await page.selectOption('select[name="plan:quiet"]', 'new');
    // ASSERT
    await expect(page.locator('textarea[name="note:quiet"]')).toHaveJSProperty('required', false);
  });
});
