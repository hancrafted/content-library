import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * DaisyUI is not installed, so its class names render nothing. A leftover is a
 * silent bug: the element just loses its colour. Colours come from the shadcn
 * tokens in globals.css; a Slide's own status colours (success, warning, info)
 * are variables in its CSS module, read as `text-(--success)`.
 */

const SRC = path.join(__dirname, '../../src');
const SOURCE = /\.(tsx?|css|mdx?)$/;

// A DaisyUI colour utility: base-100/200/300/content, neutral(-content), or a bare status colour.
const COLOUR =
  /\b(?:bg|text|border|ring|fill|stroke|from|to|via|divide|outline|shadow)-(?:base-(?:100|200|300|content)|neutral-content|neutral|success|error|warning|info)(?![\w-])/g;
// A DaisyUI component or shape class used as a class name.
const COMPONENT =
  /(?<![\w-])(?:badge(?:-[a-z]+)?|btn(?:-[a-z]+)?|rounded-box|rounded-field|input-bordered|range-(?:primary|sm)|card-body)(?![\w-])/g;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return SOURCE.test(entry.name) ? [full] : [];
  });
}

// `card` alone is plain English in prose and identifiers, so it only counts as a class of its own in a className attribute.
const CARD_CLASS = /(?:className|class)="(?:[^"]* )?card[ "]/g;

// A module specifier or a shadcn `data-slot` value names a file or a part, never a class: `'./badge'`, `"badge"` after `data-slot=`.
const NOT_CLASSES = /(?:from |import\(|data-slot=)\s*$/;

/** The quoted strings of a file that could hold class names: every one but a module specifier or a `data-slot` value. */
function classCandidates(text: string): string[] {
  return [...text.matchAll(/"[^"\n]*"|'[^'\n]*'|`[^`]*`/g)]
    .filter((match) => !NOT_CLASSES.test(text.slice(Math.max(0, match.index - 12), match.index)))
    .map((match) => match[0]);
}

function offenders(): string[] {
  return sourceFiles(SRC)
    .filter((file) => !file.endsWith('.test.ts'))
    .flatMap((file) => {
      const text = readFileSync(file, 'utf8');
      const strings = classCandidates(text);
      const hits = [
        ...strings.flatMap((chunk) => [...(chunk.match(COLOUR) ?? []), ...(chunk.match(COMPONENT) ?? [])]),
        ...(text.match(CARD_CLASS) ?? []).map(() => 'card'),
      ];
      return hits.map((hit) => `${path.relative(SRC, file)}: ${hit}`);
    });
}

describe('success cases', () => {
  it('leaves no DaisyUI class name in src', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const found = offenders();
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('recognises a DaisyUI colour utility', () => {
    // ARRANGE
    const sample = 'text-base-content/70 bg-error border-neutral-content';
    // ACT
    const hits = sample.match(COLOUR);
    // ASSERT
    expect(hits).toEqual(['text-base-content', 'bg-error', 'border-neutral-content']);
  });

  it('still finds a DaisyUI badge class beside an import of the shadcn badge', () => {
    // ARRANGE
    const sample = `import { Badge } from './badge';\n<span data-slot="badge" className="badge badge-ghost" />`;
    const expected = ['"badge badge-ghost"'];
    // ACT
    const candidates = classCandidates(sample);
    // ASSERT
    expect(candidates).toEqual(expected);
  });

  it('does not flag a Tailwind palette colour or a shadcn token', () => {
    // ARRANGE
    const sample = 'border-neutral-900 bg-destructive text-(--success) text-foreground';
    // ACT
    const hits = sample.match(COLOUR);
    // ASSERT
    expect(hits).toBeNull();
  });
});
