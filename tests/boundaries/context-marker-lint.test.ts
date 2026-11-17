import { describe, expect, it } from 'vitest';
import { lintProbe } from './lint-probe';

// decision: docs/adr/0013-context-markers.md
const SLIDE = 'src/episodes/onboard-ai-every-time/slides/probe/slide.tsx';
const TIMEOUT = 30_000;

/** The messages a marker call site draws from the guard when linted as a Slide. */
async function refused(element: string): Promise<string[]> {
  const code = `export const Probe = () => ${element};\n`;
  const diagnostics = await lintProbe(code, SLIDE);
  return diagnostics.filter((d) => d.message.includes('hit area')).map((d) => d.ruleId);
}

describe('failure cases', () => {
  it.each([
    ['a literal static', '<Marker note="n" className="static" />'],
    ['a breakpoint static', '<ContextMarker note="n" label="l" className="ml-1 md:static" />'],
    ['an important static', '<Marker note="n" className="!static" />'],
    ['a braced literal', '<Marker note="n" className={\'static\'} />'],
    ['a template literal', '<Marker note="n" className={`ml-1 static`} />'],
    ['a helper call', "<Marker note=\"n\" className={cn('ml-1', 'static')} />"],
  ])(
    'refuses %s, which would stretch the marker hit area over the whole Slide',
    async (_name, element) => {
      // ARRANGE
      const expected = ['no-restricted-syntax'];
      // ACT
      const rules = await refused(element);
      // ASSERT
      expect(rules).toEqual(expected);
    },
    TIMEOUT,
  );
});

describe('success cases', () => {
  it.each([
    ['the beside placement', '<Marker note="n" placement="beside" />'],
    ['a class that only contains the word', '<Marker note="n" className="ml-1 static-grid" />'],
    ['static on another element', '<div className="static" />'],
  ])(
    'allows %s',
    async (_name, element) => {
      // ARRANGE
      const expected: string[] = [];
      // ACT
      const rules = await refused(element);
      // ASSERT
      expect(rules).toEqual(expected);
    },
    TIMEOUT,
  );
});
