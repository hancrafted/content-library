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

/** A designer's fragment, written where the assembler reads it: `.scratch/<slug>/spec/`. */
function fragment(folder: string, html: string): void {
  const scratch = path.join(ROOT, '.scratch', path.basename(folder));
  folders.push(scratch);
  mkdirSync(path.join(scratch, 'spec'), { recursive: true });
  writeFileSync(path.join(scratch, 'spec/spent-attention.html'), html);
}

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

  it('compiles design.css with the classes the assembled Options use, even when the Spec contract fails', () => {
    // ARRANGE: a design.css compiled before any Option existed, as a Spec server started at the Brief stage leaves it,
    // and one lone Option, which the contract refuses
    const folder = episode({ 'brief.md': BRIEF, 'spec/design.css': '/* Brief stage */' });
    fragment(
      folder,
      `<!-- slide: spent-attention -->
<figure data-spec="option" data-option="1a" data-recommended>
  <div data-spec="mock" class="border-ai rounded-full">A bar</div>
  <figcaption><b>1a</b> A bar. Build cost: Scene.</figcaption>
  <div data-spec="build-notes">Keeps master.</div>
</figure>`,
    );
    // ACT
    const run = assemble(folder);
    // ASSERT
    expect(run.status).toBe(1);
    const css = readFileSync(path.join(folder, 'spec/design.css'), 'utf8');
    expect(css).toContain('.border-ai');
    expect(css).toContain('.rounded-full');
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
