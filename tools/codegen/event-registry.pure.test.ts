import { describe, expect, it } from 'vitest';
import { EVENT_REGISTRY_PATHS, eventRegistryFiles } from './event-registry.pure.ts';

const AXEL = '2026-10-23-axel-agentic-workflow.ts';
const CYBERFORUM = '2026-10-28-cyberforum-akademie-intro-agentic-workflow.ts';

/** The text of one generated file. */
function fileAt(files: readonly string[], path: string): string {
  return eventRegistryFiles(files).find((file) => file.path === path)?.text ?? '';
}

describe('success cases', () => {
  it('writes one registry file per tier: the Event slugs for lib, the Event records for the store', () => {
    // ARRANGE
    const expected = [EVENT_REGISTRY_PATHS.slugs, EVENT_REGISTRY_PATHS.records];
    // ACT
    const paths = eventRegistryFiles([AXEL]).map((file) => file.path);
    // ASSERT
    expect(paths).toEqual(expected);
  });

  it('lists every Event file as an Event slug, in file-name order', () => {
    // ARRANGE
    const expected =
      "export const EVENT_SLUGS = ['2026-10-23-axel-agentic-workflow', '2026-10-28-cyberforum-akademie-intro-agentic-workflow'] as const;";
    // ACT
    const slugs = fileAt([CYBERFORUM, AXEL], EVENT_REGISTRY_PATHS.slugs);
    // ASSERT
    expect(slugs).toContain(expected);
  });

  it("imports each Event record into the store's registry, keyed by its file name", () => {
    // ARRANGE
    const expected = [
      "import { event as _20261023AxelAgenticWorkflow } from './events/2026-10-23-axel-agentic-workflow';",
      "  '2026-10-23-axel-agentic-workflow': _20261023AxelAgenticWorkflow,",
    ];
    // ACT
    const records = fileAt([AXEL], EVENT_REGISTRY_PATHS.records);
    // ASSERT
    expected.forEach((line) => expect(records).toContain(line));
  });

  it('types the records against the Event slugs, so a record whose slug is not its file name fails tsc', () => {
    // ARRANGE
    const expected = '} as const satisfies { readonly [S in EventSlug]: EventInput & { readonly slug: S } };';
    // ACT
    const records = fileAt([AXEL], EVENT_REGISTRY_PATHS.records);
    // ASSERT
    expect(records).toContain(expected);
  });
});

describe('failure cases', () => {
  it('refuses an Event file whose name is no slug, naming the file', () => {
    // ARRANGE
    const misnamed = 'Axel Workshop.ts';
    // ACT
    const generate = () => eventRegistryFiles([AXEL, misnamed]);
    // ASSERT
    expect(generate).toThrow(misnamed);
  });
});

describe('edge cases', () => {
  it('leaves out every file that is no TypeScript Event record: a test or a note beside them', () => {
    // ARRANGE
    const expected = "export const EVENT_SLUGS = ['2026-10-23-axel-agentic-workflow'] as const;";
    // ACT
    const slugs = fileAt([AXEL, 'events.test.ts', 'README.md'], EVENT_REGISTRY_PATHS.slugs);
    // ASSERT
    expect(slugs).toContain(expected);
  });

  it('marks every registry file as generated, naming the command that rewrites it', () => {
    // ARRANGE
    const expected = 'npm run registry';
    // ACT
    const texts = eventRegistryFiles([AXEL]).map((file) => file.text);
    // ASSERT
    texts.forEach((text) => expect(text).toContain(expected));
  });
});
