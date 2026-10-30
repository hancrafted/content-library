import { describe, expect, it } from 'vitest';
import { GUIDE_REGISTRY_PATH, guideRegistryFile } from './guide-registry.pure.ts';

/* The Guide record registry `npm run registry` writes from the files in `src/content-store/guides/`. */

describe('success cases', () => {
  it('maps each Guide record file by its slug, typed against the Guide compositions', () => {
    // ARRANGE
    const expected = [
      "import { guide as setupAiAgentAndStarterFolder } from './guides/setup-ai-agent-and-starter-folder';",
      "  'setup-ai-agent-and-starter-folder': setupAiAgentAndStarterFolder,",
      '} as const satisfies { readonly [S in GuideSlug]: GuideInput & { readonly slug: S } };',
    ];
    // ACT
    const file = guideRegistryFile(['setup-ai-agent-and-starter-folder.ts']);
    // ASSERT
    expect(file.path).toBe(GUIDE_REGISTRY_PATH);
    expected.forEach((line) => expect(file.text).toContain(line));
  });
});

describe('edge cases', () => {
  it('writes an empty map while no Guide exists yet', () => {
    // ARRANGE
    const expected = /export const GUIDE_RECORDS = \{\s*\} as const satisfies/;
    // ACT
    const file = guideRegistryFile([]);
    // ASSERT
    expect(file.text).toMatch(expected);
    expect(file.text).not.toContain("from './guides/");
  });
});

describe('failure cases', () => {
  it('refuses a Guide file not named after a slug, naming it', () => {
    // ARRANGE
    const files = ['Get_Ready.ts'];
    // ACT
    const generate = () => guideRegistryFile(files);
    // ASSERT
    expect(generate).toThrow('Get_Ready.ts');
  });
});
