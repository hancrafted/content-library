import { ESLint } from 'eslint';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * Probe tests for the pure-view lint rule (FE-006, eslint.config.mjs): a `*-view.tsx` file takes no hook, handler,
 * hook import or client directive, and a file of any other name may. Each probe lints a snippet through the real
 * config under a virtual path.
 */

const ROOT = path.join(__dirname, '../..');
const eslint = new ESLint({ cwd: ROOT });
const VIEW = 'src/explorables/context-window/probe-view.tsx';
const OTHER = 'src/explorables/context-window/probe.tsx';
const TIMEOUT = 30_000;

/** The messages the no-restricted-syntax rule raises for a snippet linted as `file`. */
async function restricted(code: string, file: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: path.join(ROOT, file) });
  return result.messages.filter((m) => m.ruleId === 'no-restricted-syntax').map((m) => m.message);
}

const HOOK = "import { useState } from 'react';\nexport const Probe = () => { useState(0); return <div />; };\n";
const HANDLER = 'export const Probe = () => <button onClick={() => undefined} />;\n';
const HOOK_IMPORT = "import { useThing } from '@/shared/hooks/use-thing';\nexport const Probe = () => <div />;\n";
const CLIENT_IMPORT = "import { Leaf } from './leaf.client';\nexport const Probe = () => <Leaf />;\n";
const DIRECTIVE = "'use client';\nexport const Probe = () => <div />;\n";
const PURE = 'export const Probe = ({ a }: { a: number }) => <div style={{ width: a }} />;\n';

describe('failure cases', () => {
  it.each([
    ['a hook call', HOOK, 'no hooks'],
    ['an event handler', HANDLER, 'no event handlers'],
    ['a hook import', HOOK_IMPORT, 'imports no hook'],
    ['a client leaf import', CLIENT_IMPORT, 'imports no hook'],
    ['the client directive', DIRECTIVE, "'use client'"],
  ])(
    'refuses %s in a *-view.tsx file',
    async (_name, code, fragment) => {
      // ARRANGE
      const expected = true;
      // ACT
      const messages = await restricted(code, VIEW);
      // ASSERT
      expect(messages.some((m) => m.includes(fragment))).toBe(expected);
    },
    TIMEOUT,
  );
});

describe('success cases', () => {
  it(
    'passes a view drawn from props alone',
    async () => {
      // ARRANGE
      const expected: string[] = [];
      // ACT
      const messages = await restricted(PURE, VIEW);
      // ASSERT
      expect(messages).toEqual(expected);
    },
    TIMEOUT,
  );

  it(
    'lets a file of another name take a handler',
    async () => {
      // ARRANGE
      const expected: string[] = [];
      // ACT
      const messages = await restricted(HANDLER, OTHER);
      // ASSERT
      expect(messages).toEqual(expected);
    },
    TIMEOUT,
  );
});
