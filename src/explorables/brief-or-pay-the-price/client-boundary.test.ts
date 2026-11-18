import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { allScenarios } from './scenarios';

// decision: FE-012 §1.2
const FOLDER = import.meta.dirname;
const clientFiles = readdirSync(FOLDER).filter((file) => file.endsWith('.client.tsx'));
const FORBIDDEN = /from\s+['"](?:\.\/scenarios(?:\.ts)?|\.\/scenario\.pure|\.\/config\.pure|yaml|[^'"]*\.ya?ml)['"]/;

describe('success cases', () => {
  it('finds the client files to check', () => {
    // ARRANGE
    const found = clientFiles.length;
    // ACT
    // ASSERT
    expect(found).toBeGreaterThan(0);
  });

  it('lays every Scenario out as plain data, so the server can pass it as props', () => {
    // ARRANGE
    const layouts = allScenarios().flatMap((scenario) => Object.values(scenario.layouts));
    // ACT
    const roundTripped = layouts.map((layout) => JSON.parse(JSON.stringify(layout)));
    // ASSERT
    expect(roundTripped).toEqual(layouts);
  });
});

describe('failure cases', () => {
  it.each(clientFiles)('%s imports neither the scenarios module nor a YAML parser', (file) => {
    // ARRANGE
    const source = readFileSync(join(FOLDER, file), 'utf8');
    // ACT
    const imports = source.split('\n').filter((line) => FORBIDDEN.test(line));
    // ASSERT
    expect(imports).toEqual([]);
  });
});

describe('edge cases', () => {
  it('lets the server entry, not a client file, load the Scenarios', () => {
    // ARRANGE
    const entry = readFileSync(join(FOLDER, 'brief-or-pay-the-price-data.ts'), 'utf8');
    // ACT
    const loads = FORBIDDEN.test(entry.split('\n').find((line) => line.includes("'./scenarios'")) ?? '');
    // ASSERT
    expect(loads).toBe(true);
  });
});
