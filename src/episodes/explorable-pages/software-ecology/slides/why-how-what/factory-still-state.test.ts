import { describe, expect, it } from 'vitest';
import { factoryStillState } from './factory-still-state';

/*
 * The stills read the Explorable's own model at the AI-unbalanced tour's last step. The expected values are the
 * figures the approved Spec (Option 2b's build notes, rechecked against the retuned model) and the tour's `expect:`
 * claims give for week 20, so the stills can never show a state the Explorable does not reach.
 */
describe('success cases', () => {
  it('stands on week 20 of the AI-unbalanced tour, AI at the engineer only', () => {
    // ARRANGE
    const expected = { week: 20, ai: ['eng'] };
    // ACT
    const still = factoryStillState('en');
    // ASSERT
    expect({ week: still.week, ai: still.stations.filter((s) => s.ai).map((s) => s.id) }).toEqual(expected);
  });

  it('shows quality assurance with 223 waiting, past two weeks of work, its rack full', () => {
    // ARRANGE
    const expected = { waiting: 223, level: 2, rack: 6, inspection: true };
    // ACT
    const qa = factoryStillState('en').stations.find((s) => s.id === 'qa');
    // ASSERT
    expect({ waiting: qa?.waiting, level: qa?.level, rack: qa?.rack.length, inspection: qa?.inspection }).toEqual(
      expected,
    );
  });

  it('shows the Customer at 0.5× of ideal, 67 % satisfied and 39 days lead time', () => {
    // ARRANGE
    const expected = { output: 0.5, sat: 0.67, leadDays: 39, releases: 12 };
    const tenths = (x: number) => Math.round(x * 10) / 10;
    const hundredths = (x: number) => Math.round(x * 100) / 100;
    // ACT
    const { customer } = factoryStillState('en');
    const read = {
      output: tenths(customer.output),
      sat: hundredths(customer.sat),
      leadDays: Math.round(customer.leadDays ?? 0),
      releases: customer.releases.length,
    };
    // ASSERT
    expect(read).toEqual(expected);
  });

  it("reads the analyst's dashboard: keeping up, 13 a week, 92 % good, AI off", () => {
    // ARRANGE
    const expected = { light: 'green', out: 13, good: 92, ai: false };
    // ACT
    const { dashboard } = factoryStillState('en');
    // ASSERT
    expect({
      light: dashboard.r.light,
      out: Math.round(dashboard.r.out.now),
      good: dashboard.r.good.now,
      ai: dashboard.r.dials.ai,
    }).toEqual(expected);
  });

  it("shows the live toolbar's row at that step: the states, paused at the tour's 10×, the tour clock, the use case", () => {
    // ARRANGE
    const expected = {
      states: ['Tire swing 2.0', 'Ideal', 'Realistic'],
      speed: '10×',
      clock: 'Week 20 · Day 1',
      useCase: 'Tire swing',
    };
    // ACT
    const { toolbar } = factoryStillState('en');
    // ASSERT
    expect({ states: toolbar.states, speed: toolbar.speed, clock: toolbar.clock, useCase: toolbar.useCase }).toEqual(
      expected,
    );
  });

  it('names the work centers in the page locale', () => {
    // ARRANGE
    const expected = ['Quality assurance', 'Qualitätssicherung'];
    // ACT
    const titles = (['en', 'de'] as const).map((l) => factoryStillState(l).stations.find((s) => s.id === 'qa')?.title);
    // ASSERT
    expect(titles).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('reads the English words for a locale the Explorable has none for, never an empty title', () => {
    // ARRANGE
    const expected = 'Quality assurance';
    // ACT
    const title = factoryStillState('fr').stations.find((s) => s.id === 'qa')?.title;
    // ASSERT
    expect(title).toBe(expected);
  });
});

describe('edge cases', () => {
  it('draws every document on a belt within the floor', () => {
    // ARRANGE
    const still = factoryStillState('en');
    // ACT
    const outside = still.belts
      .flatMap((b) => b.docs)
      .filter((d) => d.x < 0 || d.x > still.width || d.y < still.top || d.y > still.top + still.height);
    // ASSERT
    expect(outside).toEqual([]);
  });
});
