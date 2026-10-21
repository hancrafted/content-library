import { describe, expect, it } from 'vitest';
import { WORKFLOW_IDS, workflowFor, type WorkflowId } from './workflow-data';
import type { Job } from './workflow.types';

const LOCALES = ['en', 'de'] as const;
const EACH = WORKFLOW_IDS.flatMap((id) => LOCALES.map((locale) => [id, locale] as const));
const jobsOf = (id: WorkflowId, locale: 'en' | 'de'): Job[] =>
  workflowFor(id, locale).stages.flatMap((stage) => stage.jobs);

describe('success cases', () => {
  it('ships the summer party and the vacation', () => {
    // ARRANGE
    const shipped = ['summer-party', 'vacation'];
    // ACT
    const ids = [...WORKFLOW_IDS];
    // ASSERT
    expect(ids).toEqual(shipped);
  });

  it.each([
    ['en', "Plan your company's next summer party: 200 employees across five offices in Europe."],
    ['de', 'Plane das nächste Sommerfest Deiner Firma: 200 Mitarbeitende an fünf Standorten in Europa.'],
  ] as const)('tells the summer party scenario in %s word for word', (locale, sentence) => {
    // ARRANGE
    const id = 'summer-party';
    // ACT
    const { scenario } = workflowFor(id, locale);
    // ASSERT
    expect(scenario).toBe(sentence);
  });

  it.each(EACH)('ends every %s prompt in %s by asking for a fenced handoff block', (id, locale) => {
    // ARRANGE
    const jobs = jobsOf(id, locale);
    // ACT
    const without = jobs.filter((job) => !/```handoff\n[\s\S]*\n```$/.test(job.prompt));
    // ASSERT
    expect(without.map((job) => job.id)).toEqual([]);
  });

  it.each(EACH)('gives every job of %s in %s a check that grades pass or fail in a fresh chat', (id, locale) => {
    // ARRANGE
    const jobs = jobsOf(id, locale);
    // ACT
    const weak = jobs.filter((job) => !job.check || job.check.criteria.length === 0 || !/pass/i.test(job.check.prompt));
    // ASSERT
    expect(weak.map((job) => job.id)).toEqual([]);
  });

  it.each(EACH)('starts every %s Technical command in %s with a slash command', (id, locale) => {
    // ARRANGE
    const commands = jobsOf(id, locale).flatMap((job) => (job.command ? [job.command] : []));
    // ACT
    const bad = commands.filter((command) => !command.startsWith('/'));
    // ASSERT
    expect(commands.length).toBeGreaterThan(0);
    expect(bad).toEqual([]);
  });

  it.each(EACH)(
    'offers a page for a result of %s in %s: Simple one HTML file, Technical a localhost page',
    (id, locale) => {
      // ARRANGE
      const pages = jobsOf(id, locale).flatMap((job) => (job.page ? [job.page] : []));
      // ACT
      const bad = pages.filter(
        ({ simple, technical }) =>
          !/HTML/.test(simple) ||
          /localhost/.test(simple) ||
          !/localhost/.test(technical) ||
          /Codeblock|code block/.test(technical),
      );
      // ASSERT
      expect(pages.length).toBeGreaterThan(0);
      expect(bad).toEqual([]);
    },
  );

  it.each(EACH)('gives every job of %s in %s after the first an example input to start from', (id, locale) => {
    // ARRANGE
    const later = jobsOf(id, locale).slice(1);
    // ACT
    const missing = later.filter((job) => !job.exampleInput);
    // ASSERT
    expect(later.length).toBeGreaterThan(0);
    expect(missing.map((job) => job.id)).toEqual([]);
  });

  it.each(EACH)('writes every %s Technical command in %s without a raw paste slot', (id, locale) => {
    // ARRANGE
    const commands = jobsOf(id, locale).flatMap((job) => (job.command ? [job.command] : []));
    // ACT
    const raw = commands.filter((command) => command.includes('{{'));
    // ASSERT
    expect(commands.length).toBeGreaterThan(0);
    expect(raw).toEqual([]);
  });

  it.each(EACH)('marks where to paste in every %s Technical command in %s that takes an input', (id, locale) => {
    // ARRANGE
    const asking = jobsOf(id, locale).filter((job) => job.command && job.inputs.length > 0);
    // ACT
    const unmarked = asking.filter((job) => !/\[[^\]]+\]/.test(job.command ?? ''));
    // ASSERT
    expect(asking.length).toBeGreaterThan(0);
    expect(unmarked.map((job) => job.id)).toEqual([]);
  });
});

describe('failure cases', () => {
  it.each(EACH)('keeps the acronym out of %s in %s', (id, locale) => {
    // ARRANGE
    const text = JSON.stringify(workflowFor(id, locale));
    // ACT
    const found = /\b(BRIEF|PRICE)\b/.exec(text);
    // ASSERT
    expect(found).toBeNull();
  });

  it.each(WORKFLOW_IDS)('tells the AI to answer in German in every German prompt, check and page of %s', (id) => {
    // ARRANGE
    const jobs = jobsOf(id, 'de');
    const german = (text: string | undefined) => !text || /auf Deutsch/.test(text);
    // ACT
    const silent = jobs.filter(
      (job) => ![job.prompt, job.check?.prompt, job.page?.simple, job.page?.technical].every(german),
    );
    // ASSERT
    expect(silent.map((job) => job.id)).toEqual([]);
  });

  it.each(WORKFLOW_IDS)('tells the AI to answer in German in every German Technical command of %s', (id) => {
    // ARRANGE
    const commands = jobsOf(id, 'de').flatMap((job) => (job.command ? [job.command] : []));
    // ACT
    const silent = commands.filter((command) => !/auf Deutsch/.test(command));
    // ASSERT
    expect(silent).toEqual([]);
  });

  it.each(WORKFLOW_IDS)('writes the German words of %s with a capital Du', (id) => {
    // ARRANGE
    const text = JSON.stringify(workflowFor(id, 'de'));
    // ACT
    const lower = text.match(/\b(du|dich|dir|dein\w*)\b/g);
    // ASSERT
    expect(lower).toBeNull();
  });
});

describe('edge cases', () => {
  it('sets the vacation for two people, one week and a recommendation for your partner', () => {
    // ARRANGE
    const { scenario } = workflowFor('vacation', 'en');
    const last = workflowFor('vacation', 'en').stages.at(-1);
    // ACT
    const text = `${scenario} ${last?.name} ${last?.moveLabel}`;
    // ASSERT
    expect(text).toMatch(/two/i);
    expect(text).toMatch(/week/i);
    expect(text).toMatch(/partner/i);
  });
});
