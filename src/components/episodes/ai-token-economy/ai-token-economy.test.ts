import {
  calcSessionCost,
  evaluateContextGauge,
  evaluateThreshold,
  MODEL_PRICINGS,
  tokenizeText,
} from '@/components/episode/token-economy-data.pure';
import {
  AI_TOKEN_ECONOMY_CONTEXT,
  contextFor,
  type AiTokenSlideKey,
  type SectionsT,
} from '@/components/episodes/ai-token-economy/context';
import {
  costOfAgenticAi,
  managingContext,
  modelTiers,
  motivation,
  theCompoundingCostCurve,
  theFullnessGaugeAndLevers,
  theLostMiddle,
  toolsAndTips,
  whatIsAToken,
} from '@/components/episodes/ai-token-economy/slides-content';
import {
  leadOneUpskillMany,
  outcomePerEuro,
  theFourErasOfAi,
  theInvisibleInvoice,
} from '@/components/episodes/ai-token-economy/slides-motivation';
import { cliVsWebToolObscurity, liveContextBreakdown } from '@/components/episodes/ai-token-economy/slides-tokens';
import { findEpisode } from '@/components/episodes/registry';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { isEpisodeSlug } from '@/lib/routes';
import { describe, expect, it } from 'vitest';

describe('success cases', () => {
  it('registers ai-token-economy as a valid episode slug and exports its record', () => {
    // ARRANGE
    const expectedSlug = 'ai-token-economy';
    const expectedYoutube = 'S0Nx4faEebY';

    // ACT
    const valid = isEpisodeSlug(expectedSlug);
    const episode = findEpisode(expectedSlug);

    // ASSERT
    expect(valid).toBe(true);
    expect(episode.slug).toBe(expectedSlug);
    expect(episode.youtube?.en).toBe(expectedYoutube);
    expect(episode.youtube?.de).toBe(expectedYoutube);
  });

  it('provides 6 sections with 15 content slides in manuscript order', () => {
    // ARRANGE
    const t: SectionsT = (key: string) => `mock:${key}`;
    const expectedSectionCount = 6;
    const expectedTotalSlides = 15;
    const expectedSections = [
      { slug: 'motivation', pageSlides: 4 },
      { slug: 'what-is-a-token', pageSlides: 2 },
      { slug: 'managing-context', pageSlides: 2 },
      { slug: 'cost-of-agentic-ai', pageSlides: 1 },
      { slug: 'model-tiers', pageSlides: 0 },
      { slug: 'tools-and-tips', pageSlides: 0 },
    ];

    // ACT
    const sections = [
      motivation(t, [leadOneUpskillMany(t), theFourErasOfAi(t), theInvisibleInvoice(t), outcomePerEuro(t)]),
      whatIsAToken(t, [liveContextBreakdown(t), cliVsWebToolObscurity(t)]),
      managingContext(t, [theLostMiddle(t), theFullnessGaugeAndLevers(t)]),
      costOfAgenticAi(t, [theCompoundingCostCurve(t)]),
      modelTiers(t),
      toolsAndTips(t),
    ];
    const totalSlides = sections.reduce((acc, sec) => acc + 1 + sec.slides.length, 0);
    const mapped = sections.map((s) => ({
      slug: s.slug,
      pageSlides: s.slides.length,
    }));

    // ASSERT
    expect(sections).toHaveLength(expectedSectionCount);
    expect(totalSlides).toBe(expectedTotalSlides);
    expect(mapped).toEqual(expectedSections);
  });

  it('defines 15 context entries matching all 15 content slides with valid notes and targets', () => {
    // ARRANGE
    const keys = Object.keys(AI_TOKEN_ECONOMY_CONTEXT) as AiTokenSlideKey[];
    const expectedContextEntries = 15;
    const read = (path: string) => `str:${path}`;

    // ACT
    const results = keys.map((key) => contextFor(read, key));

    // ASSERT
    expect(keys).toHaveLength(expectedContextEntries);
    for (const result of results) {
      expect(result.anchor).toBeTruthy();
      expect(result.notes.length).toBeGreaterThan(0);
      for (const note of result.notes) {
        expect(note.slug).toBeTruthy();
        expect(note.header).toMatch(/^str:/);
        expect(note.description).toMatch(/^str:/);
        expect(note.target).toBeTruthy();
      }
    }
  });

  it('produces valid page metadata for en and de', () => {
    // ARRANGE
    const expectedCanonicalEn = '/episode/ai-token-economy';
    const expectedCanonicalDe = '/de/episode/ai-token-economy';

    // ACT
    const metaEn = pageMetadata({ episode: 'ai-token-economy' }, 'en');
    const metaDe = pageMetadata({ episode: 'ai-token-economy' }, 'de');

    // ASSERT
    expect(metaEn.title).toBeTruthy();
    expect(metaEn.description).toBeTruthy();
    expect(metaDe.title).toBeTruthy();
    expect(metaDe.description).toBeTruthy();
    expect(metaEn.alternates?.canonical).toBe(expectedCanonicalEn);
    expect(metaDe.alternates?.canonical).toBe(expectedCanonicalDe);
  });

  it('calculates tokenization and pricing formulas correctly', () => {
    // ARRANGE
    const sampleText = 'Insanity is doing the same thing over and over again';
    const minExpectedTokens = 5;
    const expectedCheapWinner = 'cheap';
    const expectedPremiumWinner = 'premium';
    const expectedSafeZone = 'safe';
    const expectedWarningZone = 'warning';
    const expectedDangerZone = 'danger';
    const expectedPricingTiersCount = 3;

    // ACT
    const tokens = tokenizeText(sampleText);
    const cost50Turns = calcSessionCost(tokens.length, 50, 5);
    const cheapVerdict = evaluateThreshold(93);
    const premiumVerdict = evaluateThreshold(98);
    const safeGauge = evaluateContextGauge(30);
    const warningGauge = evaluateContextGauge(65);
    const dangerGauge = evaluateContextGauge(85);

    // ASSERT
    expect(tokens.length).toBeGreaterThan(minExpectedTokens);
    expect(cost50Turns).toBeGreaterThan(0);
    expect(cheapVerdict.winner).toBe(expectedCheapWinner);
    expect(premiumVerdict.winner).toBe(expectedPremiumWinner);
    expect(safeGauge.zone).toBe(expectedSafeZone);
    expect(warningGauge.zone).toBe(expectedWarningZone);
    expect(dangerGauge.zone).toBe(expectedDangerZone);
    expect(MODEL_PRICINGS).toHaveLength(expectedPricingTiersCount);
  });
});

describe('failure cases', () => {
  it('rejects an invalid episode slug lookup', () => {
    // ARRANGE
    const invalidSlug = 'non-existent-episode';

    // ACT
    const valid = isEpisodeSlug(invalidSlug);
    const lookup = () => findEpisode(invalidSlug);

    // ASSERT
    expect(valid).toBe(false);
    expect(lookup).toThrow();
  });
});

describe('edge cases', () => {
  it('handles empty text tokenization gracefully', () => {
    // ARRANGE
    const emptyText = '   ';

    // ACT
    const tokens = tokenizeText(emptyText);
    const cost = calcSessionCost(0, 50, 5);

    // ASSERT
    expect(tokens).toEqual([]);
    expect(cost).toBe(0);
  });
});
