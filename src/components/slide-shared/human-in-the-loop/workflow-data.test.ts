import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { UI_FILES, WORKFLOW_IDS, uiWords, workflowFor } from './workflow-data';

/** The dotted path of every leaf of a value, sorted. */
const keyPaths = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value)
        .flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key))
        .sort()
    : [prefix];

describe('success cases', () => {
  it.each(WORKFLOW_IDS.flatMap((id) => (['en', 'de'] as const).map((locale) => [id, locale] as const)))(
    'loads the shipped %s Workflow in %s',
    (id, locale) => {
      // ARRANGE
      const stages = 1;
      // ACT
      const workflow = workflowFor(id, locale);
      // ASSERT
      expect(workflow.id).toBe(id);
      expect(workflow.stages.length).toBeGreaterThan(stages);
    },
  );

  it('keeps the German chrome words under exactly the English keys', () => {
    // ARRANGE
    const en = parse(UI_FILES.en).ui;
    const de = parse(UI_FILES.de).ui;
    // ACT
    const drift = keyPaths(de);
    // ASSERT
    expect(drift).toEqual(keyPaths(en));
  });
});

describe('failure cases', () => {
  it('refuses a locale file whose Workflow id is not on the list', () => {
    // ARRANGE
    const known = new Set<string>(WORKFLOW_IDS);
    // ACT
    const ids = WORKFLOW_IDS.map((id) => workflowFor(id, 'en').id);
    // ASSERT
    expect(ids.filter((id) => !known.has(id))).toEqual([]);
  });
});

describe('edge cases', () => {
  it('reads the chrome words of both locales and hands back the same objects twice', () => {
    // ARRANGE
    const id = WORKFLOW_IDS[0];
    // ACT
    const en = uiWords('en');
    const de = uiWords('de');
    // ASSERT
    expect(en.tryIt).not.toBe(de.tryIt);
    expect(workflowFor(id, 'en')).toBe(workflowFor(id, 'en'));
    expect(uiWords('en')).toBe(uiWords('en'));
  });
});
