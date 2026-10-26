import { describe, expect, it } from 'vitest';
import { humanInTheLoopData } from './human-in-the-loop';

const BASE = { workflow: 'summer-party', diagram: { initials: true } } as const;

describe('success cases', () => {
  it('keeps the Slide initials for English', () => {
    // ARRANGE
    const props = { ...BASE, locale: 'en' };
    // ACT
    const data = humanInTheLoopData(props);
    // ASSERT
    expect(data.diagram?.initials).toBe(true);
  });

  it('hands the client every authored Workflow and the chosen id, with no control overridden by default', () => {
    // ARRANGE
    const props = { ...BASE, locale: 'en' };
    // ACT
    const data = humanInTheLoopData(props);
    // ASSERT
    expect(data.workflows.map((w) => w.id)).toEqual(['summer-party', 'vacation']);
    expect(data.workflowId).toBe('summer-party');
    expect(data.controls).toEqual({});
  });
});

describe('failure cases', () => {
  it('starts in the Presentation view unless the Preset names another', () => {
    // ARRANGE
    const props = { workflow: 'summer-party', locale: 'en' } as const;
    // ACT
    const plain = humanInTheLoopData(props).view;
    const preset = humanInTheLoopData({ ...props, view: 'detailed' }).view;
    // ASSERT
    expect([plain, preset]).toEqual(['presentation', 'detailed']);
  });

  it('keeps the Slide initials for German too: the letters stay English, only the tooltips are German', () => {
    // ARRANGE
    const props = { ...BASE, locale: 'de' };
    // ACT
    const data = humanInTheLoopData(props);
    // ASSERT
    expect(data.diagram?.initials).toBe(true);
    expect(data.workflows[0]?.stages[0]?.moves[0]).toMatchObject({
      letter: 'B',
      why: expect.stringContaining('Zerlege'),
    });
  });

  it('is not readonly unless the Preset says so', () => {
    // ARRANGE
    const props = { workflow: 'summer-party', locale: 'en' } as const;
    // ACT
    const open = humanInTheLoopData(props).readonly;
    const locked = humanInTheLoopData({ ...props, readonly: true }).readonly;
    // ASSERT
    expect([open, locked]).toEqual([false, true]);
  });
});

describe('edge cases', () => {
  it('falls back to English for a locale it has no words for, and passes a Preset control override through', () => {
    // ARRANGE
    const props = { workflow: 'vacation', locale: 'fr', controls: { upload: { show: false } } } as const;
    // ACT
    const data = humanInTheLoopData(props);
    // ASSERT
    expect(data.locale).toBe('en');
    expect(data.controls).toEqual({ upload: { show: false } });
    expect(data.diagram).toBeUndefined();
  });
});
