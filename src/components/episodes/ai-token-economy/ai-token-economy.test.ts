import { aiTokenEconomy } from '@/components/episodes/ai-token-economy/ai-token-economy';
import {
  calcSessionCost,
  evaluateContextGauge,
  evaluateThreshold,
  MODEL_PRICINGS,
  tokenizeText,
} from '@/components/episodes/ai-token-economy/client/token-economy-data.pure';
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

  it('composes 6 sections with 15 slides in manuscript order', () => {
    // ARRANGE
    const expectedSections = [
      { slug: 'motivation', pageSlides: 4 },
      { slug: 'what-is-a-token', pageSlides: 2 },
      { slug: 'managing-context', pageSlides: 2 },
      { slug: 'cost-of-agentic-ai', pageSlides: 1 },
      { slug: 'model-tiers', pageSlides: 0 },
      { slug: 'tools-and-tips', pageSlides: 0 },
    ];
    const expectedTotalSlides = 15;

    // ACT
    const mapped = aiTokenEconomy.sections.map(([sectionSlide, ...pages]) => ({
      slug: sectionSlide.slug,
      pageSlides: pages.length,
    }));
    const totalSlides = aiTokenEconomy.sections.reduce((acc, section) => acc + section.length, 0);

    // ASSERT
    expect(mapped).toEqual(expectedSections);
    expect(totalSlides).toBe(expectedTotalSlides);
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
