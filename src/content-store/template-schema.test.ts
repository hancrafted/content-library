import { describe, expect, it } from 'vitest';
import { TEMPLATE_TYPES } from './schemas/fields';
import { templateSchema } from './schemas/template.schema';

/*
 * The Template record (design-ADR 0019): a slug, a closed type, Tags with a lead Tag and a visibility. Its route and its
 * words are not fields.
 */

const TEMPLATE = { slug: 'timelines', type: 'master-slide', tags: ['workflow'], visibility: 'public' } as const;

/** The record with one field left out, as a file that forgot it would hold it. */
function withoutKey(record: Record<string, unknown>, key: string): Record<string, unknown> {
  const copy = { ...record };
  delete copy[key];
  return copy;
}

/** The first sentence the schema refuses a record with, or undefined when it is sound. */
function refusal(record: unknown): string | undefined {
  const result = templateSchema.safeParse(record);
  return result.success ? undefined : `${result.error.issues[0].path.join('.')} ${result.error.issues[0].message}`;
}

describe('success cases', () => {
  it.each(TEMPLATE_TYPES)('accepts a Template of type %s', (type) => {
    // ARRANGE
    const record = { ...TEMPLATE, type };
    // ACT
    const parsed = templateSchema.safeParse(record);
    // ASSERT
    expect(parsed.success).toBe(true);
  });

  it('knows exactly the two Template types', () => {
    // ARRANGE
    const expected = ['episode-template', 'master-slide'];
    // ACT
    const types = [...TEMPLATE_TYPES];
    // ASSERT
    expect(types).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a Template of a type outside the closed list, naming the list', () => {
    // ARRANGE
    const record = { ...TEMPLATE, type: 'page-template' };
    // ACT
    const sentence = refusal(record);
    // ASSERT
    expect(sentence).toBe('type is "page-template", but must be one of episode-template, master-slide');
  });

  it('refuses a Template with no type', () => {
    // ARRANGE
    const record = withoutKey(TEMPLATE, 'type');
    // ACT
    const sentence = refusal(record);
    // ASSERT
    expect(sentence).toBe('type is required, one of episode-template, master-slide');
  });

  it('refuses a Template with no visibility, so a forgotten field fails closed', () => {
    // ARRANGE
    const record = withoutKey(TEMPLATE, 'visibility');
    // ACT
    const sentence = refusal(record);
    // ASSERT
    expect(sentence).toBe('visibility is required, public or unlisted');
  });

  it('refuses a Template with no Tag', () => {
    // ARRANGE
    const record = { ...TEMPLATE, tags: [] };
    // ACT
    const sentence = refusal(record);
    // ASSERT
    expect(sentence).toContain('tags');
  });

  it('refuses a slug that is no kebab-case id', () => {
    // ARRANGE
    const record = { ...TEMPLATE, slug: 'Slide Master' };
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
    const parsed = templateSchema.parse({ ...TEMPLATE, tags: ['agentic-ai', 'workflow'] });
    // ASSERT
    expect(parsed.tags).toEqual(expected);
  });

  it('accepts an unlisted Template, which the store builds but does not list', () => {
    // ARRANGE
    const record = { ...TEMPLATE, visibility: 'unlisted' };
    // ACT
    const parsed = templateSchema.safeParse(record);
    // ASSERT
    expect(parsed.success).toBe(true);
  });
});
