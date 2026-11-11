import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AiCapability } from './ai-capability';
import { aiCapabilityData, keyPaths } from './ai-capability-data';
import { LEVELS } from './scene-frames.pure';

function render(props: Parameters<typeof AiCapability>[0]): string {
  return renderToStaticMarkup(createElement(AiCapability, props));
}

describe('success cases', () => {
  it('holds the same keys and the same Presets in the English and the German config', () => {
    // ARRANGE
    const english = aiCapabilityData('en');
    // ACT
    const german = aiCapabilityData('de');
    // ASSERT
    expect(keyPaths(german.words)).toEqual(keyPaths(english.words));
    expect(german.presets).toEqual(english.presets);
    expect(german.productivity).toEqual(english.productivity);
    expect(german.layers).toEqual(english.layers);
  });

  it('names a Level and an edge at both ends of every span in the AI disciplines and Oversight rows', () => {
    // ARRANGE
    const edges = ['start', 'mid', 'end'];
    const { layers } = aiCapabilityData('en');
    // ACT
    const ends = Object.values(layers).flatMap((items) => items.flatMap((item) => [item.from, item.to]));
    // ASSERT
    expect(ends.length).toBeGreaterThan(0);
    for (const end of ends) {
      expect(LEVELS).toContain(end.level);
      expect(edges).toContain(end.at);
    }
  });

  it('lists Explain first and on, the other chips after it and off, their rows not shown', () => {
    // ARRANGE
    const chips = ['Explain', 'Managing effort', 'Productivity increase', 'Adoption', 'AI disciplines', 'Oversight'];
    const pressed = ['true', 'false', 'false', 'false', 'false', 'false'];
    const explain = 'message by message';
    const hidden = [
      'a specialist',
      'in trials',
      'build multi-agent workflows',
      'Loop engineering',
      'Human on the loop',
    ];
    // ACT
    const html = render({ preset: 'timeline', locale: 'en' });
    const toggles = [...html.matchAll(/data-row-toggle="[a-z]+" aria-pressed="(true|false)"[^>]*>([^<]+)</g)];
    const labels = toggles.map(([, , label]) => label);
    const states = toggles.map(([, state]) => state);
    // ASSERT
    expect(labels).toEqual(chips);
    expect(states).toEqual(pressed);
    expect(html).toContain(explain);
    for (const word of hidden) expect(html).not.toContain(word);
  });

  it('draws the Factory as a lifecycle with people at its gates', () => {
    // ARRANGE
    const lifecycle = 'Lifecycle';
    const gates = 'people approve the spec and the release';
    // ACT
    const html = render({ preset: 'timeline', locale: 'en' });
    // ASSERT
    expect(html).toContain(lifecycle);
    expect(html).toContain(gates);
  });

  it('shows the four Levels in order and the model under them', () => {
    // ARRANGE
    const order = ['Prompting', 'Agenten', 'Workflows', 'Factory?'];
    const model = 'Large Language Model (LLM)';
    // ACT
    const html = render({ preset: 'timeline', locale: 'de' });
    const shown = order.map((name) => html.indexOf(`>${name}<`));
    // ASSERT
    expect(shown).toEqual([...shown].sort((a, b) => a - b));
    expect(shown).not.toContain(-1);
    expect(html).toContain(model);
  });

  it('links each definition to its source in a new tab, and says so', () => {
    // ARRANGE
    const source =
      'href="https://www.anthropic.com/engineering/building-effective-agents" target="_blank" rel="noopener noreferrer"';
    const newTab = 'opens in a new tab';
    // ACT
    const html = render({ preset: 'timeline', locale: 'en' });
    // ASSERT
    expect(html).toContain(source);
    expect(html).toContain(newTab);
  });

  it('lets a Slide say a word differently, key by key, keeping the other defaults', () => {
    // ARRANGE
    const said = 'Rows';
    const kept = 'Prompting';
    // ACT
    const html = render({ preset: 'timeline', locale: 'en', words: { rows: { label: said } } });
    // ASSERT
    expect(html).toContain(said);
    expect(html).toContain(kept);
  });
});

describe('failure cases', () => {
  it('refuses a Preset the config does not hold', () => {
    // ARRANGE
    const unknown = 'nonsense' as 'timeline';
    const refusal = 'unknown Preset';
    // ACT
    const attempt = () => render({ preset: unknown, locale: 'en' });
    // ASSERT
    expect(attempt).toThrow(refusal);
  });

  it('falls back to the English words for a locale it has no pair for', () => {
    // ARRANGE
    const english = 'Productivity increase';
    // ACT
    const html = render({ preset: 'timeline', locale: 'fr' });
    // ASSERT
    expect(html).toContain(english);
  });
});

describe('edge cases', () => {
  it("lights the Preset's level on a recap, with no scene playing", () => {
    // ARRANGE
    const lit = 'data-level="workflows" data-on="true"';
    const dimmed = 'data-level="prompting" data-on="false"';
    // ACT
    const html = render({ preset: 'recap', locale: 'en' });
    // ASSERT
    expect(html).toContain(lit);
    expect(html).toContain(dimmed);
  });

  it("marks the element a Speaker note explains, and places a Slide's marker on its card", () => {
    // ARRANGE
    const target = 'data-target="agents"';
    const marker = '<i data-test-marker="agents"></i>';
    // ACT
    const html = render({
      preset: 'timeline',
      locale: 'en',
      targets: { agents: { 'data-target': 'agents' } },
      markers: { agents: createElement('i', { 'data-test-marker': 'agents' }) },
    });
    // ASSERT
    expect(html).toContain(target);
    expect(html).toContain(marker);
  });
});
