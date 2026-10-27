import { describe, expect, it } from 'vitest';
import { relatedEpisodes } from './related-episodes.pure';

interface Stub {
  readonly slug: string;
  readonly ref: { readonly kind: 'standalone' | 'event-copy' };
  readonly status: 'published' | 'upcoming';
  readonly visibility: 'public' | 'unlisted';
  readonly tags: readonly string[];
  readonly publishedOn?: string;
}

/** A public, published Episode no Event owns. */
const episode = (slug: string, tags: readonly string[], publishedOn: string): Stub => ({
  slug,
  ref: { kind: 'standalone' },
  status: 'published',
  visibility: 'public',
  tags,
  publishedOn,
});
/** The Event: its Tags and the slugs its Playlist lists (a copy keeps its original's slug). */
const event = (tags: readonly string[], ...listed: string[]) => ({
  tags,
  playlist: { episodes: listed.map((slug) => ({ episode: { slug } })) },
});
const slugs = (found: readonly Stub[]) => found.map(({ slug }) => slug);

describe('success cases', () => {
  it('offers the public published Episodes that share a Tag with the Event', () => {
    // ARRANGE
    const all = [episode('cost-one', ['cost'], '2026-01-01'), episode('sales-one', ['sales'], '2026-01-02')];
    const expected = ['cost-one'];
    // ACT
    const related = relatedEpisodes(event(['cost', 'workflow']), all);
    // ASSERT
    expect(slugs(related)).toEqual(expected);
  });

  it('leaves out the originals of the Episodes the Playlist copies', () => {
    // ARRANGE
    const all = [episode('taught', ['workflow'], '2026-01-01'), episode('other', ['workflow'], '2026-01-02')];
    const expected = ['other'];
    // ACT
    const related = relatedEpisodes(event(['workflow'], 'taught'), all);
    // ASSERT
    expect(slugs(related)).toEqual(expected);
  });

  it('sorts the newest release first', () => {
    // ARRANGE
    const all = [episode('old', ['cost'], '2026-01-01'), episode('new', ['cost'], '2026-03-01')];
    const expected = ['new', 'old'];
    // ACT
    const related = relatedEpisodes(event(['cost']), all);
    // ASSERT
    expect(slugs(related)).toEqual(expected);
  });

  it('keeps at most three', () => {
    // ARRANGE
    const all = ['a', 'b', 'c', 'd'].map((slug, i) => episode(slug, ['cost'], `2026-01-0${i + 1}`));
    const expected = ['d', 'c', 'b'];
    // ACT
    const related = relatedEpisodes(event(['cost']), all);
    // ASSERT
    expect(slugs(related)).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('never offers an Event copy, an unlisted, or an unpublished Episode', () => {
    // ARRANGE
    const all: Stub[] = [
      { ...episode('copy', ['cost'], '2026-01-01'), ref: { kind: 'event-copy' } },
      { ...episode('hidden', ['cost'], '2026-01-01'), visibility: 'unlisted' },
      { ...episode('soon', ['cost'], '2026-01-01'), status: 'upcoming' },
    ];
    // ACT
    const related = relatedEpisodes(event(['cost']), all);
    // ASSERT
    expect(related).toEqual([]);
  });
});

describe('edge cases', () => {
  it('offers nothing when no Episode shares a Tag', () => {
    // ARRANGE
    const all = [episode('sales-one', ['sales'], '2026-01-01')];
    // ACT
    const related = relatedEpisodes(event(['cost']), all);
    // ASSERT
    expect(related).toEqual([]);
  });
});
