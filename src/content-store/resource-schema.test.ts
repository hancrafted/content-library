import { describe, expect, it } from 'vitest';
import { RESOURCE_TYPES } from './schemas/fields';
import { resourceSchema } from './schemas/resource.schema';

/*
 * The Resource record (design-ADR 0019): a slug, a closed type, Tags with a lead Tag and a visibility. Its route and its
 * words are not fields.
 */

const RESOURCE = { slug: 'timelines', type: 'master-slide', tags: ['workflow'], visibility: 'public' } as const;

/** The record with one field left out, as a file that forgot it would hold it. */
function withoutKey(record: Record<string, unknown>, key: string): Record<string, unknown> {
  const copy = { ...record };
  delete copy[key];
  return copy;
}

/** The first sentence the schema refuses a record with, or undefined when it is sound. */
function refusal(record: unknown): string | undefined {
  const result = resourceSchema.safeParse(record);
  return result.success ? undefined : `${result.error.issues[0].path.join('.')} ${result.error.issues[0].message}`;
}

describe('success cases', () => {
  it.each(RESOURCE_TYPES)('accepts a Resource of type %s', (type) => {
    // ARRANGE
    const record = { ...RESOURCE, type };
    // ACT
    const parsed = resourceSchema.safeParse(record);
    // ASSERT
    expect(parsed.success).toBe(true);
  });

  it('knows exactly the three Resource types', () => {
    // ARRANGE
    const expected = ['explorable-explanation', 'episode-template', 'master-slide'];
    // ACT
    const types = [...RESOURCE_TYPES];
    // ASSERT
    expect(types).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a Resource of a type outside the closed list, naming the list', () => {
    // ARRANGE
    const record = { ...RESOURCE, type: 'page-template' };
    // ACT
    const sentence = refusal(record);
    // ASSERT
    expect(sentence).toBe(
      'type is "page-template", but must be one of explorable-explanation, episode-template, master-slide',
    );
  });

  it('refuses a Resource with no type', () => {
    // ARRANGE
    const record = withoutKey(RESOURCE, 'type');
    // ACT
    const sentence = refusal(record);
    // ASSERT
    expect(sentence).toBe('type is required, one of explorable-explanation, episode-template, master-slide');
  });

  it('refuses a Resource with no visibility, so a forgotten field fails closed', () => {
    // ARRANGE
    const record = withoutKey(RESOURCE, 'visibility');
    // ACT
    const sentence = refusal(record);
    // ASSERT
    expect(sentence).toBe('visibility is required, public or unlisted');
  });

  it('refuses a Resource with no Tag', () => {
    // ARRANGE
    const record = { ...RESOURCE, tags: [] };
    // ACT
    const sentence = refusal(record);
    // ASSERT
    expect(sentence).toContain('tags');
  });

  it('refuses a slug that is no kebab-case id', () => {
    // ARRANGE
    const record = { ...RESOURCE, slug: 'Slide Master' };
    // ACT
    const sentence = refusal(record);
    // ASSERT
    expect(sentence).toBe('slug must be kebab-case');
  });
});

describe('edge cases', () => {
  it('keeps the order of several Tags, so the first stays the lead Tag', () => {
    // ARRANGE
    const expected = ['agentic-ai', 'workflow'];
    // ACT
    const parsed = resourceSchema.parse({ ...RESOURCE, tags: ['agentic-ai', 'workflow'] });
    // ASSERT
    expect(parsed.tags).toEqual(expected);
  });

  it('accepts an unlisted Resource, which the store builds but does not list', () => {
    // ARRANGE
    const record = { ...RESOURCE, visibility: 'unlisted' };
    // ACT
    const parsed = resourceSchema.safeParse(record);
    // ASSERT
    expect(parsed.success).toBe(true);
  });
});
