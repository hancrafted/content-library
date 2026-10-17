import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

// A real subprocess (ARCH-003 §1.1): the ticket (#228) asks for the command's page, exit code and refusal end to end.
/* `npm run episode:spec-assemble` on a temp Episode folder: reads what exists and writes `spec/spec.html`. */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SCRIPT = path.join(ROOT, 'skills/new-episode/scripts/spec-assemble.ts');

const BRIEF = `---
type: brief
title: Budget
---

# Budget

## Style

Editorial.

## Slides

### Why it forgets

1. (A) **Spent attention** — the window fills. _Visual:_ a bar.
`;

const folders: string[] = [];
afterEach(() => {
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true });
});

function episode(files: Record<string, string>): string {
  const folder = mkdtempSync(path.join(os.tmpdir(), 'spec-assemble-'));
  folders.push(folder);
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(folder, name)), { recursive: true });
    writeFileSync(path.join(folder, name), text);
  }
  return folder;
}

const assemble = (folder: string) => spawnSync('node', [SCRIPT, folder], { cwd: ROOT, encoding: 'utf8' });

describe('success cases', () => {
  it('writes the Spec from the Brief alone', () => {
    // ARRANGE
    const folder = episode({ 'brief.md': BRIEF });
    // ACT
    const run = assemble(folder);
    // ASSERT
    expect(run.status).toBe(0);
    const html = readFileSync(path.join(folder, 'spec/spec.html'), 'utf8');
    expect(html).toContain('data-spec="slide" id="spent-attention"');
  });
});

describe('failure cases', () => {
  it('refuses an approved Spec and leaves it untouched', () => {
    // ARRANGE
    const approved = `<script type="application/json" id="spec-meta">{"type":"spec","generated":{"by":"x","at":"2026-10-12T12:00:00Z"},"verified":[{"by":"human:han","at":"2026-10-12T13:00:00Z"}]}</script>`;
    const folder = episode({ 'brief.md': BRIEF, 'spec/spec.html': approved });
    // ACT
    const run = assemble(folder);
    // ASSERT
    expect(run.status).toBe(1);
    expect(run.stderr).toContain('approved');
    expect(readFileSync(path.join(folder, 'spec/spec.html'), 'utf8')).toBe(approved);
  });

  it('exits 1 without a Brief', () => {
    // ARRANGE
    const folder = episode({});
    // ACT
    const run = assemble(folder);
    // ASSERT
    expect(run.status).toBe(1);
  });
});
