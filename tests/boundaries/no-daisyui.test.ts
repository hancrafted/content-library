import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = path.join(__dirname, '../../src');
const SOURCE = /\.(tsx?|css|mdx?)$/;

const DAISYUI_COLOUR_UTILITY =
  /\b(?:bg|text|border|ring|fill|stroke|from|to|via|divide|outline|shadow)-(?:base-(?:100|200|300|content)|neutral-content|neutral|success|error|warning|info)(?![\w-])/g;
const DAISYUI_COMPONENT_OR_SHAPE_CLASS =
  /(?<![\w-])(?:badge(?:-[a-z]+)?|btn(?:-[a-z]+)?|rounded-box|rounded-field|input-bordered|range-(?:primary|sm)|card-body)(?![\w-])/g;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return SOURCE.test(entry.name) ? [full] : [];
  });
}

const CARD_ONLY_AS_CLASS_ATTRIBUTE_CLASS = /(?:className|class)="(?:[^"]* )?card[ "]/g;

const BEFORE_MODULE_SPECIFIER_OR_DATA_SLOT = /(?:from |import\(|data-slot=)\s*$/;

function classCandidates(text: string): string[] {
  return [...text.matchAll(/"[^"\n]*"|'[^'\n]*'|`[^`]*`/g)]
    .filter(
      (match) => !BEFORE_MODULE_SPECIFIER_OR_DATA_SLOT.test(text.slice(Math.max(0, match.index - 12), match.index)),
    )
    .map((match) => match[0]);
}

function offenders(): string[] {
  return sourceFiles(SRC)
    .filter((file) => !file.endsWith('.test.ts'))
    .flatMap((file) => {
      const text = readFileSync(file, 'utf8');
      const strings = classCandidates(text);
      const hits = [
        ...strings.flatMap((chunk) => [
          ...(chunk.match(DAISYUI_COLOUR_UTILITY) ?? []),
          ...(chunk.match(DAISYUI_COMPONENT_OR_SHAPE_CLASS) ?? []),
        ]),
        ...(text.match(CARD_ONLY_AS_CLASS_ATTRIBUTE_CLASS) ?? []).map(() => 'card'),
      ];
      return hits.map((hit) => `${path.relative(SRC, file)}: ${hit}`);
    });
}

describe('success cases', () => {
  it('leaves no DaisyUI class name in src, since DaisyUI is not installed and a leftover silently renders nothing', () => {
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
    const hits = sample.match(DAISYUI_COLOUR_UTILITY);
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
    const hits = sample.match(DAISYUI_COLOUR_UTILITY);
    // ASSERT
    expect(hits).toBeNull();
  });
});
