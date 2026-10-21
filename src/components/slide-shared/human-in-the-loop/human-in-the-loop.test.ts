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
  it('drops the Slide initials for German, here and nowhere else', () => {
    // ARRANGE
    const props = { ...BASE, locale: 'de' };
    // ACT
    const data = humanInTheLoopData(props);
    // ASSERT
    expect(data.diagram?.initials).toBe(false);
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
