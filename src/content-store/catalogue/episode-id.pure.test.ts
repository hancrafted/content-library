import { describe, expect, it } from 'vitest';
import { episodeRef, episodeRefOf, folderOf, matchEpisode, templateRef } from './episode-id.pure';

/*
 * The Episode id module (GLOSSARY, Episode id): the one place that knows an Event's copy is named
 * `<event-slug>__<slug>`. Code passes an EpisodeRef (GLOSSARY). These tests, and the folder walker's, which checks the
 * id it names a copy's folder by, are the only ones that write an id out by hand.
 */

const EVENT = '2026-10-23-axel-agentic-workflow';

describe('success cases', () => {
  it("reads an Event's copy's id as its Event and its slug", () => {
    // ARRANGE
    const id = '2026-10-23-axel-agentic-workflow__ai-attention-span';
    const expected = { kind: 'event-copy', id, event: EVENT, slug: 'ai-attention-span' };
    // ACT
    const ref = episodeRefOf(id);
    // ASSERT
    expect(ref).toEqual(expected);
  });

  it('reads an id without an Event as an Episode no Event owns, its slug the id itself', () => {
    // ARRANGE
    const id = 'ai-attention-span';
    const expected = { kind: 'standalone', id, slug: id };
    // ACT
    const ref = episodeRefOf(id);
    // ASSERT
    expect(ref).toEqual(expected);
  });

  it('builds the ref of a slug, or of a slug its Event owns, as the parse of its id reads it', () => {
    // ARRANGE
    const expected = [
      { kind: 'standalone', id: 'ai-attention-span', slug: 'ai-attention-span' },
      {
        kind: 'event-copy',
        id: '2026-10-23-axel-agentic-workflow__ai-attention-span',
        event: EVENT,
        slug: 'ai-attention-span',
      },
    ];
    // ACT
    const built = [episodeRef('ai-attention-span'), episodeRef('ai-attention-span', EVENT)];
    const parsed = built.map(({ id }) => episodeRefOf(id));
    // ASSERT
    expect(built).toEqual(expected);
    expect(parsed).toEqual(expected);
  });

  it('gives the folder of an Episode no Event owns, of an Event copy, and of a Template', () => {
    // ARRANGE
    const expected = [
      'ai-attention-span',
      'by-event/2026-10-23-axel-agentic-workflow/ai-attention-span',
      'templates/slide-master',
    ];
    // ACT
    const folders = [
      folderOf(episodeRef('ai-attention-span')),
      folderOf(episodeRef('ai-attention-span', EVENT)),
      folderOf(templateRef('slide-master')),
    ];
    // ASSERT
    expect(folders).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('hands each kind of Episode to its own case only', () => {
    // ARRANGE
    const refs = [episodeRef('ai-attention-span'), episodeRef('ai-attention-span', EVENT)];
    const expected = ['standalone ai-attention-span', `copy of ${EVENT}`];
    // ACT
    const seen = refs.map((ref) =>
      matchEpisode(ref, {
        standalone: ({ slug }) => `standalone ${slug}`,
        'event-copy': ({ event }) => `copy of ${event}`,
      }),
    );
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('splits a copy at its first separator, so a slug keeps any separator after it', () => {
    // ARRANGE
    const id = 'event__slug__tail';
    const expected = { kind: 'event-copy', id, event: 'event', slug: 'slug__tail' };
    // ACT
    const ref = episodeRefOf(id);
    // ASSERT
    expect(ref).toEqual(expected);
  });
});
