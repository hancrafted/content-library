import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Mirror, sameMirror } from './mirror.client';
import { FLIGHT_EASING } from './zoom-flights';
import { NARROW_REM, orientationOf } from './zoom-geometry.pure';

// decision: FE-012 §4.1
const FOLDER = import.meta.dirname;
const read = (file: string) => readFileSync(join(FOLDER, file), 'utf8');
const PARTS = ['levels.client.tsx', 'workflow-level.client.tsx', 'workflow-controls.client.tsx'];
const MEMO = Symbol.for('react.memo');

describe('success cases', () => {
  it('keeps the brace flight hook in a plain .ts file with no directive', () => {
    // ARRANGE
    const source = read('use-brace-flight.ts');
    // ACT
    const directive = /^['"]use client['"]/m.test(source);
    // ASSERT
    expect(directive).toBe(false);
    expect(existsSync(join(FOLDER, 'brace-flight.client.tsx'))).toBe(false);
  });

  it('picks the vertical layout below the 48rem breakpoint', () => {
    // ARRANGE
    const rem = 16;
    // ACT
    const seen = [orientationOf(NARROW_REM * rem - 1, rem), orientationOf(NARROW_REM * rem, rem)];
    // ASSERT
    expect(seen).toEqual(['vertical', 'horizontal']);
  });
});

describe('failure cases', () => {
  it.each(PARTS)('%s hands no part dispatch and names no event type', (file) => {
    // ARRANGE
    const source = read(file);
    // ACT
    const found = source.match(/dispatch|type: '/g);
    // ASSERT
    expect(found).toBeNull();
  });

  it('reads the orientation from one place and shares one flight easing', () => {
    // ARRANGE
    const sources = ['use-brace-flight.ts', 'use-zoom-flights.ts', 'zoom-flights.ts'].map(read).join('\n');
    // ACT
    const orientReads = sources.match(/data-orient|isNarrow\(/g);
    const easings = sources.match(/cubic-bezier\((?:\.|0\.)5, ?0, ?(?:\.|0\.)2, ?1\)/g);
    // ASSERT
    expect(orientReads).toBeNull();
    expect(easings).toEqual([FLIGHT_EASING]);
  });
});

describe('edge cases', () => {
  it('memoises the Mirror, and a new reads array with the same values does not redraw it', () => {
    // ARRANGE
    const read = {
      shown: true,
      pass: 1,
      looping: false,
      blank: false,
      turned: { freelancer: false, ai: false },
    };
    const base = {
      definition: {},
      wiping: false,
      labels: {},
      handlers: {},
      reads: [read],
    } as never as Parameters<typeof sameMirror>[0];
    // ACT
    const same = sameMirror(base, {
      ...base,
      reads: [{ ...read, turned: { ...read.turned } }],
    });
    const changed = sameMirror(base, {
      ...base,
      reads: [{ ...read, looping: true }],
    });
    // ASSERT
    expect((Mirror as unknown as { $$typeof: symbol }).$$typeof).toBe(MEMO);
    expect([same, changed]).toEqual([true, false]);
  });
});
