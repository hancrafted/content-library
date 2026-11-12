import { describe, expect, it } from 'vitest';
import { startSettings } from './factory-dials.pure.ts';
import { createFactory } from './factory-model.pure.ts';
import type { Bundle, CenterDef, RoleDef, Settings } from './software-ecology.types';
import { builtinBundle } from './use-case-data.ts';

/*
 * Defect origin and catch (design-ADR 0024 §5, grill 11 Q200, Q201, Q210): a bad document carries the kind of its
 * first defect, `spec` (made bad at or before Analysis) or `code` (from Engineering on); a station sends back only the
 * kinds its `catch` names; a bad release comes back by its kind, a change request or a bug.
 */
const SEED = 11;
const WEEKS = 40;
const MEASURES = [
  'customer.changesPerWeek',
  'customer.bugsPerWeek',
  'ba.rework',
  'eng.rework',
  'qa.unread',
  'ops.stall',
];

/** Tire swing with one work center's fields changed. */
const changed = (id: string, patch: Partial<CenterDef>): Bundle => {
  const B = builtinBundle('tire');
  const centers = B.data.centers.map((c) => (c.id === id ? { ...c, ...patch } : c));
  return { ...B, data: { ...B.data, centers } };
};

/** Tire swing with one role's profile changed. */
const withRole = (id: string, patch: Partial<RoleDef>): Bundle => {
  const B = builtinBundle('tire');
  return { ...B, roles: { ...B.roles, [id]: { ...(B.roles[id] as RoleDef), ...patch } } };
};

/** In practice with work centers' effectiveness set (and AI where `ai` says), run WEEKS: the measures read then. */
const readAt = (B: Bundle, effective: Record<string, number>, ai: Settings['ai'] = 'off'): Record<string, number> => {
  const s: Settings = startSettings(B, B.data.presets.find((p) => p.id === 'realistic') as never);
  const over = Object.fromEntries(Object.entries(effective).map(([id, effv]) => [id, { effv }]));
  const f = createFactory(B, { ...s, over, ai }, SEED);
  f.step(WEEKS);
  return f.read({ measures: MEASURES }).measures;
};
const PERFECT = { sales: 100, pm: 100, support: 100, ba: 100, eng: 100, qa: 100, ops: 100 };

describe('success cases', () => {
  it('returns bad specs as change requests and no bugs, when only Analysis makes mistakes', () => {
    // ARRANGE
    const B = builtinBundle('tire');
    // ACT
    const m = readAt(B, { ...PERFECT, ba: 60 });
    // ASSERT
    expect(m['customer.changesPerWeek']).toBeGreaterThan(0);
    expect(m['customer.bugsPerWeek']).toBe(0);
  });

  it('returns bad code as bugs and no change requests, when only Engineering makes mistakes', () => {
    // ARRANGE
    const B = builtinBundle('tire');
    // ACT
    const m = readAt(B, { ...PERFECT, eng: 60 });
    // ASSERT
    expect(m['customer.bugsPerWeek']).toBeGreaterThan(0);
    expect(m['customer.changesPerWeek']).toBe(0);
  });

  it('lets quality assurance send back code and pass bad specs: it tests against the spec', () => {
    // ARRANGE
    const B = builtinBundle('tire');
    // ACT
    const specOnly = readAt(B, { ...PERFECT, ba: 60 }),
      codeOnly = readAt(B, { ...PERFECT, eng: 60 });
    // ASSERT
    expect(specOnly['eng.rework']).toBe(0);
    expect(codeOnly['eng.rework']).toBeGreaterThan(0);
  });

  it('lets Engineering question bad specs back to Analysis', () => {
    // ARRANGE
    const B = builtinBundle('tire');
    // ACT
    const m = readAt(B, { ...PERFECT, ba: 60 });
    // ASSERT
    expect(m['ba.rework']).toBeGreaterThan(0);
  });

  it('passes more bad code unread at quality assurance when its AI review is trusted', () => {
    // ARRANGE
    const trusted = withRole('qa', { aiCatch: 0.3 }),
      careful = withRole('qa', { aiCatch: 1 });
    // ACT
    const [a, b] = [readAt(trusted, { ...PERFECT, eng: 60 }, ['qa']), readAt(careful, { ...PERFECT, eng: 60 }, ['qa'])];
    // ASSERT
    expect(a['qa.unread']).toBeGreaterThan(b['qa.unread'] ?? 0);
  });

  it('slows a stalled station by its share once its weeks waiting reach the mark', () => {
    // ARRANGE
    const slow = 0.5;
    const B = changed('ops', { stall: { at: 0, slow } });
    // ACT
    const m = readAt(B, PERFECT);
    // ASSERT
    expect(m['ops.stall']).toBe(slow);
  });
});

describe('failure cases', () => {
  it('sends nothing back at a station whose catch leaves the arriving kind out', () => {
    // ARRANGE
    const B = changed('eng', { catch: { code: 0.5 } });
    // ACT
    const m = readAt(B, { ...PERFECT, ba: 60 });
    // ASSERT
    expect(m['ba.rework']).toBe(0);
  });

  it('removes the stall while AI works at the station', () => {
    // ARRANGE
    const B = changed('ops', { stall: { at: 0, slow: 0.5 } });
    // ACT
    const m = readAt(B, PERFECT, ['ops']);
    // ASSERT
    expect(m['ops.stall']).toBe(0);
  });
});

describe('edge cases', () => {
  it('reads nothing unread where no bad work arrives', () => {
    // ARRANGE
    const B = withRole('qa', { aiCatch: 0.3 });
    // ACT
    const m = readAt(B, PERFECT, ['qa']);
    // ASSERT
    expect(m['qa.unread']).toBe(0);
  });

  it('leaves the catch alone while AI is off, whatever the AI review profile', () => {
    // ARRANGE
    const B = withRole('qa', { aiCatch: 0 });
    // ACT
    const m = readAt(B, { ...PERFECT, eng: 60 });
    // ASSERT
    expect(m['qa.unread']).toBeLessThan(1);
  });

  it('sends a kind back at the catch chance, over the mechanics rework strength', () => {
    // ARRANGE
    const low = changed('eng', { catch: { spec: 0.1 } }),
      high = changed('eng', { catch: { spec: 0.9 } });
    // ACT
    const [a, b] = [readAt(low, { ...PERFECT, ba: 60 }), readAt(high, { ...PERFECT, ba: 60 })];
    // ASSERT
    expect(b['ba.rework']).toBeGreaterThan(a['ba.rework'] ?? 0);
  });

  it('loses no speed while the work waiting stays below the mark', () => {
    // ARRANGE
    const B = changed('ops', { stall: { at: 40, slow: 0.5 } });
    // ACT
    const m = readAt(B, PERFECT);
    // ASSERT
    expect(m['ops.stall']).toBe(0);
  });
});
