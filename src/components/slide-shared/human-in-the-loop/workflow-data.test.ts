import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { PAIRS, UI_FILES, WORKFLOW_IDS, uiWords, workflowFor } from './workflow-data';
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

  it('keeps the German words under exactly the English keys, for every Workflow and for the chrome', () => {
    // ARRANGE
    const pairs = WORKFLOW_IDS.map((id) => [parse(PAIRS[id].config).words, parse(PAIRS[id].de).words]);
    const chrome = [parse(UI_FILES.en).ui, parse(UI_FILES.de).ui];
    // ACT
    const drift = [...pairs, chrome].map(([en, de]) => [keyPaths(en), keyPaths(de)]);
    // ASSERT
    for (const [en, de] of drift) expect(de).toEqual(en);
  });

  it("shows a Slide's words over the defaults, key by key, and leaves the rest", () => {
    // ARRANGE
    const id = WORKFLOW_IDS[0];
    const said = 'The Slide says so';
    const plain = workflowFor(id, 'en');
    // ACT
    const over = workflowFor(id, 'en', { stages: { compare: { name: said } } });
    // ASSERT
    expect(over.stages.find((stage) => stage.id === 'compare')?.name).toBe(said);
    expect(over.stages.find((stage) => stage.id === 'research')?.name).toBe(
      plain.stages.find((stage) => stage.id === 'research')?.name,
    );
  });
});

describe('failure cases', () => {
  it('throws every problem of a Slide override that breaks the Workflow', () => {
    // ARRANGE
    const id = WORKFLOW_IDS[0];
    const broken = { jobs: { spec: { prompt: '' } } };
    // ACT
    const load = () => workflowFor(id, 'en', broken);
    // ASSERT
    expect(load).toThrow(/spec/);
  });
});

describe('edge cases', () => {
  it('reads the chrome words of both locales and hands back the same Workflow object twice', () => {
    // ARRANGE
    const id = WORKFLOW_IDS[0];
    // ACT
    const en = uiWords('en');
    const de = uiWords('de');
    // ASSERT
    expect(en.modeTry).not.toBe(de.modeTry);
    expect(workflowFor(id, 'en')).toBe(workflowFor(id, 'en'));
  });
});
