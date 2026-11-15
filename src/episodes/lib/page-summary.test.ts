import { episodeRef, explorablePageRef, guideRef, templateRef } from '@/content-store/catalogue/episode-id.pure';
import { EXPLORABLE_PAGE_SLUGS, GUIDE_SLUGS, hasPage, TEMPLATE_SLUGS } from '@/content-store/catalogue/record-routes';
import { listEpisodes, listEvents } from '@/content-store/store';
import { tocSectionsOf } from '@/episodes/components/episode-page/episode-page-container.pure';
import { episodeMinutes } from '@/episodes/components/slide-master/localized-slide';
import { localizeSlideOutline } from '@/episodes/components/slide-master/slide-outline';
import { LOCALES } from '@/shared/lib/locale.pure';
import { describe, expect, it } from 'vitest';
import { placeSections, sectionOf } from './episode.pure';
import { summaryOf } from './page-summary';
import { anchorTitleAt } from './page-summary.pure';
import { compositionOf, type ComposedPage } from './registry';

/*
 * The light summary (FE-004 §4): what a page says of itself, read without importing its Slides. It must say exactly
 * what the composition says, for every composed page the registry holds, so a card, an overview or an Event's
 * navigation shows the same words, minutes and outline as the page itself.
 */

/** Every composed page: each Episode with a page, each Template, Explorable page and Guide. */
const COMPOSED: readonly ComposedPage[] = [
  ...listEpisodes().flatMap(({ ref }) => (hasPage(ref) ? [ref] : [])),
  ...TEMPLATE_SLUGS.map((slug) => templateRef(slug)),
  ...EXPLORABLE_PAGE_SLUGS.map((slug) => explorablePageRef(slug)),
  ...GUIDE_SLUGS.map((slug) => guideRef(slug)),
];

/** Every composed page in every locale, labelled for the test name. */
const IN_LOCALES = COMPOSED.flatMap((page) =>
  LOCALES.map((locale) => ({ label: `${page.id} in ${locale}`, page, locale })),
);

/** Every Playlist entry that opens its Episode at a Section's anchor, with the Event presenting it. */
const ANCHORED = listEvents().flatMap(({ slug, playlist }) =>
  playlist.episodes.flatMap(({ page, anchor }) =>
    page === undefined || anchor === undefined || anchor.includes('--')
      ? []
      : [{ label: `${page.id}#${anchor} in ${slug}`, page, anchor }],
  ),
);

describe('success cases', () => {
  it.each(IN_LOCALES)(
    "says $label's own title, caption and description (else run `npm run registry`)",
    ({ page, locale }) => {
      // ARRANGE
      const { title, caption, description } = compositionOf(page).messages[locale];
      // ACT
      const summary = summaryOf(page)[locale];
      // ASSERT
      expect(summary).toMatchObject({ title, caption, description });
    },
  );

  it.each(IN_LOCALES)(
    "quotes $label's whole reading time and table of contents (else run `npm run registry`)",
    ({ page, locale }) => {
      // ARRANGE
      const composition = compositionOf(page);
      const minutes = episodeMinutes(composition, locale);
      const sections = tocSectionsOf(
        placeSections(composition.sections)
          .flat()
          .map((slide) => localizeSlideOutline(slide, locale)),
      );
      // ACT
      const summary = summaryOf(page)[locale];
      // ASSERT
      expect(summary).toMatchObject({ minutes, sections });
    },
  );

  it("reads an Episode's German title without its Slides", () => {
    // ARRANGE
    const expected = 'Warum KI eine seltsame Aufmerksamkeitsspanne hat, die Du managen lernen musst';
    // ACT
    const { title } = summaryOf(episodeRef('ai-attention-span')).de;
    // ASSERT
    expect(title).toBe(expected);
  });

  it.each(ANCHORED)('names the Section $label opens at, as its composition does', ({ page, anchor }) => {
    // ARRANGE
    const expected = LOCALES.map((locale) => sectionOf(compositionOf(page).sections, anchor)?.messages[locale].title);
    // ACT
    const titles = LOCALES.map((locale) => anchorTitleAt(summaryOf(page)[locale], anchor));
    // ASSERT
    expect(titles).toEqual(expected);
  });
  it('names a page Slide by its own title when the anchor is that Slide', () => {
    // ARRANGE
    const expected = 'Make it a skill';
    const summary = {
      title: '',
      caption: '',
      description: '',
      minutes: 0,
      sections: [
        {
          id: 'hands-on',
          title: 'Hands-on',
          minutes: 0,
          items: [{ id: 'hands-on--make-it-a-skill', title: expected, minutes: 0 }],
        },
      ],
    };
    // ACT
    const title = anchorTitleAt(summary, 'hands-on--make-it-a-skill');
    // ASSERT
    expect(title).toBe(expected);
  });
});

describe('failure cases', () => {
  it('throws for an Episode the summaries do not hold', () => {
    // ARRANGE
    const unregistered = 'non-existent-episode';
    // ACT
    // @ts-expect-error -- an Episode the registry does not hold has no summary
    const lookup = () => summaryOf(episodeRef(unregistered));
    // ASSERT
    expect(lookup).toThrow(unregistered);
  });

  it('names no Section for an anchor the page does not have', () => {
    // ARRANGE
    const anchor = 'no-such-section';
    // ACT
    const title = anchorTitleAt(summaryOf(episodeRef('onboard-ai-every-time')).en, anchor);
    // ASSERT
    expect(title).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('names the titled Slide an untitled Slide is folded into', () => {
    // ARRANGE
    const expected = 'Titled';
    const summary = {
      title: '',
      caption: '',
      description: '',
      minutes: 0,
      sections: [
        {
          id: 'section',
          title: expected,
          minutes: 0,
          items: [
            { id: 'section--titled', title: 'Titled', minutes: 0, unlisted: [{ id: 'section--quiet', minutes: 0 }] },
          ],
        },
      ],
    };
    // ACT
    const title = anchorTitleAt(summary, 'section--quiet');
    // ASSERT
    expect(title).toBe(expected);
  });

  it('keeps a Template apart from an Episode of the same slug', () => {
    // ARRANGE
    const template = 'workshop-template';
    // ACT
    // @ts-expect-error -- a Template's slug names no Episode
    const lookup = () => summaryOf(episodeRef(template));
    // ASSERT
    expect(lookup).toThrow(template);
  });
});
