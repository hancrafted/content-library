import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { PAIRS, UI_FILES, WORKFLOW_IDS, outputWords, uiWords, workflowFor } from './workflow-data';
import { keyPaths } from './workflow-words.pure';

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

  it('keeps the German words under exactly the English keys, for every Workflow , for the chrome and for the output words', () => {
    // ARRANGE
    const pairs = WORKFLOW_IDS.map((id) => [parse(PAIRS[id].config).words, parse(PAIRS[id].de).words]);
    const chrome = [parse(UI_FILES.en).ui, parse(UI_FILES.de).ui];
    const output = [parse(UI_FILES.en).output, parse(UI_FILES.de).output];
    // ACT
    const drift = [...pairs, chrome, output].map(([en, de]) => [keyPaths(en), keyPaths(de)]);
    // ASSERT
    for (const [en, de] of drift) expect(de).toEqual(en);
  });

  it('has every label of the renderers in English from the YAML alone, and the same keys in German', () => {
    // ARRANGE
    const keys = Object.keys(parse(UI_FILES.en).output).sort();
    // ACT
    const en = outputWords('en');
    const de = outputWords('de');
    // ASSERT
    expect(Object.keys(en).sort()).toEqual(keys);
    expect(Object.keys(de).sort()).toEqual(keys);
    expect(en.done).toBe('Done');
    expect(de.done).not.toBe(en.done);
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
    expect(outputWords('de')).toBe(outputWords('de'));
  });
});
