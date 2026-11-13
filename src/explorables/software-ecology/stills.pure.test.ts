import { describe, expect, it } from 'vitest';
import { stillOf } from './stills.pure';

/*
 * The stills read the Explorable's own model through the use case's `still` state: week 20 of In practice with AI at
 * Engineering (tire.yml, grill 11 Q215, Q216). The expected values are what that state reads on the shipped seed, tuned
 * by the eval so its check holds (the Customer below 0.5 satisfied, quality assurance far past its rack), so the stills
 * can never show a state the Explorable does not reach.
 */
describe('success cases', () => {
  it('stands on week 20 of In practice with AI at the engineer only', () => {
    // ARRANGE
    const expected = { week: 20, ai: ['eng'] };
    // ACT
    const still = stillOf('tire', 'still', 'en');
    // ASSERT
    expect({ week: still.week, ai: still.stations.filter((s) => s.ai).map((s) => s.id) }).toEqual(expected);
  });

  it('shows quality assurance with 562 waiting, past two weeks of work, its rack full', () => {
    // ARRANGE
    const expected = { waiting: 562, level: 2, rack: 6, inspection: true };
    // ACT
    const qa = stillOf('tire', 'still', 'en').stations.find((s) => s.id === 'qa');
    // ASSERT
    expect({ waiting: qa?.waiting, level: qa?.level, rack: qa?.rack.length, inspection: qa?.inspection }).toEqual(
      expected,
    );
  });

  it('shows the Customer at 0.5× of ideal, 40 % satisfied and 107 days lead time', () => {
    // ARRANGE
    const expected = { output: 0.5, sat: 0.4, leadDays: 107, releases: 20 };
    const tenths = (x: number) => Math.round(x * 10) / 10;
    const hundredths = (x: number) => Math.round(x * 100) / 100;
    // ACT
    const { customer } = stillOf('tire', 'still', 'en');
    const read = {
      output: tenths(customer.output),
      sat: hundredths(customer.sat),
      leadDays: Math.round(customer.leadDays ?? 0),
      releases: customer.releases.length,
    };
    // ASSERT
    expect(read).toEqual(expected);
  });

  it("reads the analyst's dashboard: keeping up, 13 a week, 91 % good, AI off", () => {
    // ARRANGE
    const expected = { light: 'green', out: 13, good: 91, ai: false };
    // ACT
    const { dashboard } = stillOf('tire', 'still', 'en');
    // ASSERT
    expect({
      light: dashboard.r.light,
      out: Math.round(dashboard.r.out.now),
      good: dashboard.r.good.now,
      ai: dashboard.r.dials.ai,
    }).toEqual(expected);
  });

  it('names the work centers in the page locale', () => {
    // ARRANGE
    const expected = ['Quality assurance', 'Qualitätssicherung'];
    // ACT
    const titles = (['en', 'de'] as const).map(
      (l) => stillOf('tire', 'still', l).stations.find((s) => s.id === 'qa')?.title,
    );
    // ASSERT
    expect(titles).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('reads the English words for a locale the Explorable has none for, never an empty title', () => {
    // ARRANGE
    const expected = 'Quality assurance';
    // ACT
    const title = stillOf('tire', 'still', 'fr').stations.find((s) => s.id === 'qa')?.title;
    // ASSERT
    expect(title).toBe(expected);
  });
});

describe('edge cases', () => {
  it('draws every document on a belt within the floor', () => {
    // ARRANGE
    const still = stillOf('tire', 'still', 'en');
    // ACT
    const outside = still.belts
      .flatMap((b) => b.docs)
      .filter((d) => d.x < 0 || d.x > still.width || d.y < still.top || d.y > still.top + still.height);
    // ASSERT
    expect(outside).toEqual([]);
  });
});
