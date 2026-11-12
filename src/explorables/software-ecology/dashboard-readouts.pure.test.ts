import { describe, expect, it } from 'vitest';
import { dashboardOf, effToPos, posToEff, sparkPaths } from './dashboard-readouts.pure.ts';
import { FactoryRun } from './factory-run.pure.ts';
import type { FactoryNode } from './factory.types';
import { builtinBundle } from './use-case-data.ts';

const warmed = (preset: string) => new FactoryRun({ B: builtinBundle('tire'), preset, now: true });
const node = (run: FactoryRun, id: string): FactoryNode => {
  const n = run.m.nodes.get(id);
  if (!n) throw new Error(`no ${id}`);
  return n;
};

describe('success cases', () => {
  it('lights quality assurance red at AI compare: a bottleneck, its backlog growing, with weeks of work waiting', () => {
    // ARRANGE
    const run = warmed('ai-compare');
    const redFrom = 2;
    // ACT
    const d = dashboardOf(node(run, 'qa'), run.m.s);
    // ASSERT
    expect(d.light).toBe('red');
    expect(d.signals[0]).toMatchObject({ kind: 'bottleneck', level: 'red' });
    expect(d.signals[0]?.n).toBeGreaterThan(redFrom);
    expect(d.drain?.kind).toBe('grow');
  });

  it('reads the engineer at AI compare as set and with AI: 88 % efficiency runs at 220 %', () => {
    // ARRANGE
    const run = warmed('ai-compare');
    const [set, effective] = [88, 220];
    // ACT
    const d = dashboardOf(node(run, 'eng'), run.m.s);
    // ASSERT
    expect(d.dials.ai).toBe(true);
    expect([d.dials.eff, d.dials.effEff]).toEqual([set, effective]);
  });

  it('draws a trend as a line and its area over 100 by 34, with a dashed reference', () => {
    // ARRANGE
    const line = 'M0.0 32.0 L50.0 17.0 L100.0 2.0';
    const ref = 'M0 17.0 L100 17.0';
    // ACT
    const p = sparkPaths([0, 5, 10], 5, 10);
    // ASSERT
    expect(p.line).toBe(line);
    expect(p.ref).toBe(ref);
    expect(p.area.startsWith(line)).toBe(true);
  });
});

describe('failure cases', () => {
  it('keeps the lead time back until the backlog is steady over four weeks', () => {
    // ARRANGE
    const run = new FactoryRun({ B: builtinBundle('tire'), preset: 'ideal', now: true, clear: true });
    // ACT
    const d = dashboardOf(node(run, 'qa'), run.m.s);
    // ASSERT
    expect(d.flows.lead).toBeNull();
  });
});

describe('edge cases', () => {
  it('maps the efficiency slider on a log scale, 10 % to 1000 %, rounding as the reference build does', () => {
    // ARRANGE
    const [lo, mid, hi] = [10, 100, 1000];
    const [posLo, posMid, posHi] = [0, 100, 200];
    const between = 250;
    // ACT
    const pos = [effToPos(lo), effToPos(mid), effToPos(hi)];
    const back = posToEff(140);
    // ASSERT
    expect(pos).toEqual([posLo, posMid, posHi]);
    expect(back).toBe(between);
  });

  it('shows Keeping up, green, at a calm Ideal', () => {
    // ARRANGE
    const run = warmed('ideal');
    // ACT
    const d = dashboardOf(node(run, 'sales'), run.m.s);
    // ASSERT
    expect(d.light).toBe('green');
    expect(d.signals.map((s) => s.kind)).toEqual(['ok']);
    expect(d.drain).toBeNull();
  });
});
