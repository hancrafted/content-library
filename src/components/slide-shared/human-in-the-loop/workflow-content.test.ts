import { describe, expect, it } from 'vitest';
import { handoffBlocks, parseHandoff } from './handoff.pure';
import { WORKFLOW_IDS, workflowFor, type WorkflowId } from './workflow-data';
import type { Job } from './workflow.types';

const LOCALES = ['en', 'de'] as const;
const LOCAL_PAGE = /localhost|local web server|lokalen Webserver/;
const STALE = /Quiet to talk|Ruhig genug zum Reden|Frontier/;

/** Every string anywhere in a value. */
const strings = (value: unknown): string[] =>
  typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];

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
    const without = jobs.filter((job) => !/```handoff\n[\s\S]*\n```$/.test(job.run.prompt));
    // ASSERT
    expect(without.map((job) => job.id)).toEqual([]);
  });

  it.each(EACH)('gives every job of %s in %s a check that grades pass or fail in a fresh chat', (id, locale) => {
    // ARRANGE
    const jobs = jobsOf(id, locale);
    // ACT
    const weak = jobs.filter(
      (job) => !job.check || job.check.criteria.length === 0 || !/pass|bestanden/i.test(job.check.prompt),
    );
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
          !LOCAL_PAGE.test(technical) ||
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

  it.each(EACH)('carries its example data inline in every %s Technical command in %s', (id, locale) => {
    // ARRANGE
    const asking = jobsOf(id, locale).filter((job) => job.command && job.inputs.length > 0);
    // ACT
    const unfinished = asking.filter((job) => /\[[^\]]+\]/.test(job.command ?? ''));
    // ASSERT
    expect(asking.length).toBeGreaterThan(0);
    expect(unfinished.map((job) => job.id)).toEqual([]);
  });

  it.each(EACH)('gives every %s job in %s a todo line for each step and no {{slot}} anywhere', (id, locale) => {
    // ARRANGE
    const jobs = jobsOf(id, locale);
    // ACT
    const todoless = jobs.filter(
      (job) => !job.run.todo || (job.check && !job.check.todo) || (job.page && !job.page.todo),
    );
    const slotted = JSON.stringify(workflowFor(id, locale)).includes('{{');
    // ASSERT
    expect(todoless.map((job) => job.id)).toEqual([]);
    expect(slotted).toBe(false);
  });

  it.each(EACH)('offers the short grill on the interview of %s in %s and on no other job', (id, locale) => {
    // ARRANGE
    const jobs = jobsOf(id, locale);
    // ACT
    const short = jobs.filter((job) => job.run.short !== undefined).map((job) => job.id);
    // ASSERT
    expect(short).toEqual(['interview']);
  });

  it.each(EACH)('names the first stage of %s in %s Plan and the last Review, in the locale words', (id, locale) => {
    // ARRANGE
    const stages = workflowFor(id, locale).stages;
    // ACT
    const names = [stages[0]?.name, stages.at(-1)?.name];
    // ASSERT
    expect(names).toEqual(['Plan', locale === 'en' ? 'Review' : 'Prüfen']);
  });

  it.each(WORKFLOW_IDS)('gives %s its own requirements card lines, unlike the other Workflow', (id) => {
    // ARRANGE
    const linesOf = (each: WorkflowId) => workflowFor(each, 'en').stages.find((stage) => stage.card)?.card?.lines ?? [];
    const other = WORKFLOW_IDS.find((each) => each !== id) as WorkflowId;
    // ACT
    const lines = linesOf(id);
    // ASSERT
    expect(lines.length).toBeGreaterThan(0);
    expect(lines).not.toEqual(linesOf(other));
  });

  it.each(EACH)('puts a tooltip on every BRIEF letter of %s in %s', (id, locale) => {
    // ARRANGE
    const moves = workflowFor(id, locale).stages.flatMap((stage) => stage.moves);
    const shortest = 10;
    // ACT
    const letters = moves.map((move) => move.letter).join('');
    // ASSERT
    expect(letters).toBe('BIRFE');
    expect(moves.every((move) => move.why.length > shortest)).toBe(true);
  });

  it.each(EACH)('parses every filled handoff block inside the %s prompts in %s', (id, locale) => {
    // ARRANGE
    const blocks = strings(jobsOf(id, locale)).flatMap(handoffBlocks);
    // ACT
    const filled = blocks.filter((block) => !block.includes('<'));
    const broken = filled.filter((block) => 'problem' in parseHandoff(block));
    // ASSERT
    expect(filled.length).toBeGreaterThan(0);
    expect(broken).toEqual([]);
  });

  it.each(EACH)('keeps the retired wording out of %s in %s', (id, locale) => {
    // ARRANGE
    const text = strings(workflowFor(id, locale)).join('\n');
    // ACT
    const stale = text.match(STALE);
    // ASSERT
    expect(stale).toBeNull();
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
      (job) => ![job.run.prompt, job.run.short, job.check?.prompt, job.page?.simple, job.page?.technical].every(german),
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
  it('sets the vacation for two people and one week', () => {
    // ARRANGE
    const { scenario } = workflowFor('vacation', 'en');
    const last = workflowFor('vacation', 'en').stages.at(-1);
    // ACT
    const text = `${scenario} ${last?.name}`;
    // ASSERT
    expect(text).toMatch(/two/i);
    expect(text).toMatch(/week/i);
  });
});
