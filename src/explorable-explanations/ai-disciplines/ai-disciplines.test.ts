import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AiDisciplines } from './ai-disciplines';
import { aiDisciplinesData, keyPaths } from './ai-disciplines-data';

function render(props: Parameters<typeof AiDisciplines>[0]): string {
  return renderToStaticMarkup(createElement(AiDisciplines, props));
}

describe('success cases', () => {
  it('holds the same keys and the same Presets in the English and the German config', () => {
    // ARRANGE
    const english = aiDisciplinesData('en');
    // ACT
    const german = aiDisciplinesData('de');
    // ASSERT
    expect(keyPaths(german.words)).toEqual(keyPaths(english.words));
    expect(german.presets).toEqual(english.presets);
  });

  it('shows the four disciplines in order, the scale above them and the model under them', () => {
    // ARRANGE
    const order = ['Prompting', 'Agenten', 'Workflows', 'Factory?'];
    const scale = 'einem Team';
    const model = 'Sprachmodell (LLM)';
    // ACT
    const html = render({ preset: 'timeline', locale: 'de' });
    const shown = order.map((name) => html.indexOf(`>${name}<`));
    // ASSERT
    expect(shown).toEqual([...shown].sort((a, b) => a - b));
    expect(shown).not.toContain(-1);
    expect(html).toContain(scale);
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
    const said = 'Compare with';
    const kept = 'Prompting';
    // ACT
    const html = render({ preset: 'timeline', locale: 'en', words: { comparable: said } });
    // ASSERT
    expect(html).toContain(said);
    expect(html).toContain(kept);
  });
});

describe('failure cases', () => {
  it('refuses a Preset the config does not hold', () => {
    // ARRANGE
    const unknown = 'nonsense' as 'timeline';
    // ACT
    const attempt = () => render({ preset: unknown, locale: 'en' });
    // ASSERT
    expect(attempt).toThrow('unknown Preset');
  });

  it('falls back to the English words for a locale it has no pair for', () => {
    // ARRANGE
    const english = 'Comparable to';
    // ACT
    const html = render({ preset: 'timeline', locale: 'fr' });
    // ASSERT
    expect(html).toContain(english);
  });
});

describe('edge cases', () => {
  it("lights the Preset's discipline on a recap, with no scene playing", () => {
    // ARRANGE
    const lit = 'data-discipline="workflows" data-on="true"';
    const dimmed = 'data-discipline="prompting" data-on="false"';
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
