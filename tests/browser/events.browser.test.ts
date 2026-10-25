import { expect, test } from '@playwright/test';

/*
 * The browser seam of an Event (`npm run test:browser`, against the built export): the Playlist's order on the Event
 * page, the past notice on the Event page and on its Event-scoped Episode pages, the walk through the Playlist, and the
 * robots tag an unlisted Episode carries there. Each test is titled in Han's words (design-ADR 0016, Event page
 * behaviour). The AXEL Event took place on 2026-10-23, so every build after it renders it past. That an upcoming Event
 * shows no notice is pinned in the fast suite (`src/components/events/past-notice.test.ts`): no upcoming Event exists
 * to open here.
 */

const EVENT = '/events/2026-10-23-axel-agentic-workflow/';
const DE_EVENT = '/de/events/2026-10-23-axel-agentic-workflow/';
const AGENDA = `${EVENT}episodes/axel-agentic-workflow-agenda/`;
const ONBOARD = `${EVENT}episodes/onboard-ai-every-time/`;
const ATTENTION = `${EVENT}episodes/ai-attention-span/`;
const NOTICE = '[data-past-notice]';
const EN_NOTICE =
  'This Event has already taken place. The content below is kept up to date and may differ from the recording.';
const DE_NOTICE =
  'Diese Veranstaltung hat bereits stattgefunden. Die Inhalte werden laufend aktualisiert und können von der Aufzeichnung abweichen.';

test.describe('success cases', () => {
  test("An Event's page lists its Episodes in the Playlist's order, event-frame first", async ({ page }) => {
    // ARRANGE
    const expected = [
      'AXEL Seminar: the agenda',
      'Treat AI like a brilliant freelancer with amnesia',
      'Why AI has a weird attention span you must learn to manage',
      'Will AI reduce your work? It adds work: managing it.',
    ];
    const steps = page.locator('ol[data-event-playlist] > li[data-agenda-step]');
    // ACT
    await page.goto(EVENT);
    // ASSERT
    await expect(steps.locator('a[data-card-link]')).toHaveText(expected);
    await expect(steps.first()).toHaveAttribute('data-event-frame', '');
    await expect(page.locator('ol[data-event-playlist] > li[data-event-frame]')).toHaveCount(1);
  });

  test('A past Event says its content may differ from the recording; an upcoming Event does not', async ({ page }) => {
    // ARRANGE
    const role = 'note';
    // ACT
    await page.goto(EVENT);
    const notice = page.locator(NOTICE);
    // ASSERT
    await expect(notice).toHaveText(EN_NOTICE);
    await expect(notice).toHaveAttribute('role', role);
    await expect(page.locator(`${NOTICE} ~ section ol[data-event-playlist]`)).toBeVisible();
  });

  test('I open an unlisted Episode from its Event and the notice is above the title', async ({ page }) => {
    // ARRANGE
    const following = 4; // Node.DOCUMENT_POSITION_FOLLOWING: the h1 comes after the notice.
    // ACT
    await page.goto(AGENDA);
    const notice = page.locator(NOTICE);
    await expect(notice).toHaveText(EN_NOTICE);
    const order = await notice.evaluate((el) => el.compareDocumentPosition(document.querySelector('h1')!));
    // ASSERT
    expect(order & following).toBe(following);
  });

  test('I can walk the Playlist from an Episode', async ({ page }) => {
    // ARRANGE
    const position = 'Episode 2 of 4';
    // ACT
    await page.goto(ONBOARD);
    await expect(page.locator('[data-playlist-position]')).toHaveText(position);
    await page.locator('[data-playlist-next]').click();
    await expect(page).toHaveURL(ATTENTION);
    await page.locator('[data-playlist-previous]').click();
    // ASSERT
    await expect(page).toHaveURL(ONBOARD);
    await page.locator('[data-playlist-previous]').click();
    await expect(page).toHaveURL(AGENDA);
  });

  test('The German Event page warns in German', async ({ page }) => {
    // ARRANGE
    const english = page.getByText(EN_NOTICE);
    // ACT
    await page.goto(DE_EVENT);
    // ASSERT
    await expect(page.locator(NOTICE)).toHaveText(DE_NOTICE);
    await expect(english).toHaveCount(0);
  });

  test('An unlisted Episode reached from its Event tells search engines not to index it', async ({ page }) => {
    // ARRANGE
    const noindex = /noindex/;
    // ACT
    await page.goto(AGENDA);
    // ASSERT
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', noindex);
  });
});

test.describe('failure cases', () => {
  test("The notice is not on a public Episode's own page", async ({ page }) => {
    // ARRANGE
    const ownPage = '/episodes/onboard-ai-every-time/';
    // ACT
    await page.goto(ownPage);
    await expect(page.locator('h1')).toBeVisible();
    // ASSERT
    await expect(page.locator(NOTICE)).toHaveCount(0);
    await expect(page.locator('[data-playlist-position]')).toHaveCount(0);
  });
});

test.describe('edge cases', () => {
  test('the first Episode of the Playlist has no previous one, only the way back to its Event', async ({ page }) => {
    // ARRANGE
    const position = 'Episode 1 of 4';
    // ACT
    await page.goto(AGENDA);
    await expect(page.locator('[data-playlist-position]')).toHaveText(position);
    // ASSERT
    await expect(page.locator('[data-playlist-previous]')).toHaveCount(0);
    await page.locator('[data-playlist-back]').click();
    await expect(page).toHaveURL(EVENT);
  });
});
