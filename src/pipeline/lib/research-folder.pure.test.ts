import { describe, expect, it } from 'vitest';
import { checkResearchFolders, researchCategories } from './research-folder.pure';

/*
 * Research folder names, `<category>-<####>__<question-slug>`, against the
 * categories GLOSSARY.md lists: a valid set, then one broken rule per test.
 */

const GLOSSARY = `# Content library

## Research categories

**AIE**: AI Enablement: how people and organizations learn to work with AI.

**SALES**: Selling: how a buyer is won.

## Localization

**Locale**: a language the site is served in.
`;

const CATEGORIES = ['AIE', 'SALES'];

function messages(folders: string[]): string[] {
  return checkResearchFolders(folders, CATEGORIES).map(({ message }) => message);
}

describe('success cases', () => {
  it('reads the category IDs from the glossary section, and only from it', () => {
    // ARRANGE
    const expected = ['AIE', 'SALES'];
    // ACT
    const categories = researchCategories(GLOSSARY);
    // ASSERT
    expect(categories).toEqual(expected);
  });

  it('finds nothing in folder names of known categories with unique IDs', () => {
    // ARRANGE
    const folders = [
      'docs/episodes/a/research/AIE-0001__why-ai-is-onboarded-like-a-colleague',
      'docs/episodes/a/research/SALES-0001__why-buyers-trust-a-demo-first',
      'docs/llm-wiki/research/SALES/SALES-0002__why-pipelines-take-months',
    ];
    // ACT
    const findings = messages(folders);
    // ASSERT
    expect(findings).toEqual([]);
  });
});

describe('failure cases', () => {
  it('rejects a folder name outside the format', () => {
    // ARRANGE
    const folders = ['docs/episodes/a/research/onboarding-lens'];
    const expected = [
      'docs/episodes/a/research/onboarding-lens is no research folder name: <category>-<####>__<question-slug, 20-40 chars kebab-case>.',
    ];
    // ACT
    const findings = messages(folders);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('rejects a question slug shorter than 20 or longer than 40 characters', () => {
    // ARRANGE
    const short = 'docs/episodes/a/research/AIE-0001__too-short';
    const long = `docs/episodes/a/research/AIE-0002__${'a'.repeat(41)}`;
    const rejected = 2;
    // ACT
    const findings = messages([short, long]);
    // ASSERT
    expect(findings).toHaveLength(rejected);
  });

  it('rejects a category the glossary does not list', () => {
    // ARRANGE
    const folders = ['docs/episodes/a/research/OPS-0001__why-deploys-fail-on-fridays'];
    const expected = [
      'docs/episodes/a/research/OPS-0001__why-deploys-fail-on-fridays names the category OPS, which GLOSSARY.md does not list under Research categories.',
    ];
    // ACT
    const findings = messages(folders);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('rejects an llm-wiki folder outside the folder of its category', () => {
    // ARRANGE
    const folders = [
      'docs/llm-wiki/research/AIE-0001__why-context-improves-ai-output',
      'docs/llm-wiki/research/SALES/AIE-0002__why-ai-is-onboarded-like-a-colleague',
    ];
    const expected = [
      'docs/llm-wiki/research/AIE-0001__why-context-improves-ai-output sits outside its category folder: move it to docs/llm-wiki/research/AIE/.',
      'docs/llm-wiki/research/SALES/AIE-0002__why-ai-is-onboarded-like-a-colleague sits outside its category folder: move it to docs/llm-wiki/research/AIE/.',
    ];
    // ACT
    const findings = messages(folders);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('rejects an ID two folders share, wherever they sit', () => {
    // ARRANGE
    const folders = [
      'docs/episodes/a/research/AIE-0001__why-ai-is-onboarded-like-a-colleague',
      'docs/llm-wiki/research/AIE/AIE-0001__why-context-improves-ai-output',
    ];
    const expected = [
      'The research ID AIE-0001 names 2 folders: docs/episodes/a/research/AIE-0001__why-ai-is-onboarded-like-a-colleague, docs/llm-wiki/research/AIE/AIE-0001__why-context-improves-ai-output.',
    ];
    // ACT
    const findings = messages(folders);
    // ASSERT
    expect(findings).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('counts one folder named twice, as the pipeline output and the folder on disk, once', () => {
    // ARRANGE
    const folder = 'docs/episodes/a/research/AIE-0001__why-ai-is-onboarded-like-a-colleague';
    // ACT
    const findings = messages([folder, folder]);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('reads no categories from a glossary without the section', () => {
    // ARRANGE
    const glossary = '# Content library\n\n## Localization\n\n**Locale**: a language.\n';
    // ACT
    const categories = researchCategories(glossary);
    // ASSERT
    expect(categories).toEqual([]);
  });
});
