import { describe, expect, it } from 'vitest';
import {
  featured,
  filterEpisodes,
  formatCounts,
  groupByTopic,
  newest,
  parseEpisodeIndex,
  topicCounts,
  upcoming,
  type EpisodeIndexEntry,
} from './episode-index.pure';

const PUBLISHED = {
  slug: 'ai-token-economy',
  status: 'published',
  topic: 'economics',
  format: 'foundations',
  accent: 'amber',
  icon: 'coins',
  publishedOn: '2026-10-09',
  featuredRank: 2,
};

const UPCOMING = {
  slug: 'rolling-out-ai-in-a-team',
  status: 'upcoming',
  topic: 'adoption',
  format: 'short',
  accent: 'sky',
  icon: 'users',
};

/** A copy of an entry with one field left out. */
function without(entry: Record<string, unknown>, field: string): Record<string, unknown> {
  return Object.fromEntries(Object.entries(entry).filter(([key]) => key !== field));
}

const SHARED = { accent: 'primary', icon: 'book-open' } as const;

/** Five hand-placed entries: three published (two share a rank), two upcoming. */
const INDEX: readonly EpisodeIndexEntry[] = [
  {
    ...SHARED,
    slug: 'amnesiac-freelancer',
    status: 'published',
    topic: 'ai-collaboration',
    format: 'foundations',
    publishedOn: '2026-10-08',
    featuredRank: 1,
  },
  {
    ...SHARED,
    slug: 'maintaining-markdown-for-ai',
    status: 'published',
    topic: 'documentation',
    format: 'teardown',
    publishedOn: '2026-10-09',
    featuredRank: 2,
  },
  {
    ...SHARED,
    slug: 'ai-token-economy',
    status: 'published',
    topic: 'economics',
    format: 'foundations',
    publishedOn: '2026-10-09',
    featuredRank: 2,
  },
  { ...SHARED, slug: 'ai-in-code-review', status: 'upcoming', topic: 'ai-collaboration', format: 'short' },
  { ...SHARED, slug: 'rolling-out-ai', status: 'upcoming', topic: 'adoption', format: 'foundations' },
];

const slugs = (entries: readonly EpisodeIndexEntry[]) => entries.map(({ slug }) => slug);

describe('success cases', () => {
  it('reads a published and an upcoming entry exactly as written', () => {
    // ARRANGE
    const raw = [PUBLISHED, UPCOMING];
    const expected = [
      {
        slug: 'ai-token-economy',
        status: 'published',
        topic: 'economics',
        format: 'foundations',
        accent: 'amber',
        icon: 'coins',
        publishedOn: '2026-10-09',
        featuredRank: 2,
      },
      {
        slug: 'rolling-out-ai-in-a-team',
        status: 'upcoming',
        topic: 'adoption',
        format: 'short',
        accent: 'sky',
        icon: 'users',
      },
    ];
    // ACT
    const entries = parseEpisodeIndex(raw);
    // ASSERT
    expect(entries).toEqual(expected);
  });

  it('features published Episodes by rank, and the newer first among equals', () => {
    // ARRANGE
    const expected = ['amnesiac-freelancer', 'ai-token-economy', 'maintaining-markdown-for-ai'];
    // ACT
    const picked = featured(INDEX, 3);
    // ASSERT
    expect(slugs(picked)).toEqual(expected);
  });

  it('lists published Episodes newest first, the slug breaking a tie in alphabetical order', () => {
    // ARRANGE
    const expected = ['ai-token-economy', 'maintaining-markdown-for-ai', 'amnesiac-freelancer'];
    // ACT
    const picked = newest(INDEX, 3);
    // ASSERT
    expect(slugs(picked)).toEqual(expected);
  });

  it('lists upcoming Episodes in the order the index gives them', () => {
    // ARRANGE
    const expected = ['ai-in-code-review', 'rolling-out-ai'];
    // ACT
    const picked = upcoming(INDEX);
    // ASSERT
    expect(slugs(picked)).toEqual(expected);
  });

  it('groups entries by topic in vocabulary order, leaving empty topics out', () => {
    // ARRANGE
    const expected = [
      ['ai-collaboration', ['amnesiac-freelancer', 'ai-in-code-review']],
      ['documentation', ['maintaining-markdown-for-ai']],
      ['economics', ['ai-token-economy']],
      ['adoption', ['rolling-out-ai']],
    ];
    // ACT
    const groups = groupByTopic(INDEX).map(({ topic, entries }) => [topic, slugs(entries)]);
    // ASSERT
    expect(groups).toEqual(expected);
  });

  it('filters by topic, format or both, and by status', () => {
    // ARRANGE
    const expectedTopic = ['amnesiac-freelancer', 'ai-in-code-review'];
    const expectedBoth = ['amnesiac-freelancer'];
    const expectedFormat = ['maintaining-markdown-for-ai'];
    const expectedStatus = ['ai-in-code-review', 'rolling-out-ai'];
    // ACT
    const byTopic = filterEpisodes(INDEX, { topic: 'ai-collaboration' });
    const byBoth = filterEpisodes(INDEX, { topic: 'ai-collaboration', format: 'foundations', status: 'published' });
    const byFormat = filterEpisodes(INDEX, { format: 'teardown' });
    const byStatus = filterEpisodes(INDEX, { status: 'upcoming' });
    // ASSERT
    expect(slugs(byTopic)).toEqual(expectedTopic);
    expect(slugs(byBoth)).toEqual(expectedBoth);
    expect(slugs(byFormat)).toEqual(expectedFormat);
    expect(slugs(byStatus)).toEqual(expectedStatus);
  });

  it('counts the entries under each topic and format, in vocabulary order, listing only those that hold any', () => {
    // ARRANGE
    const expectedTopics = [
      { id: 'ai-collaboration', count: 2 },
      { id: 'documentation', count: 1 },
      { id: 'economics', count: 1 },
      { id: 'adoption', count: 1 },
    ];
    const expectedFormats = [
      { id: 'foundations', count: 3 },
      { id: 'teardown', count: 1 },
      { id: 'short', count: 1 },
    ];
    // ACT
    const topics = topicCounts(INDEX);
    const formats = formatCounts(INDEX);
    // ASSERT
    expect(topics).toEqual(expectedTopics);
    expect(formats).toEqual(expectedFormats);
  });
});

describe('failure cases', () => {
  it('refuses a topic the vocabulary does not know', () => {
    // ARRANGE
    const raw = [{ ...PUBLISHED, topic: 'cooking' }];
    const message = 'ai-token-economy: topic "cooking" is not one of';
    // ACT
    const parse = () => parseEpisodeIndex(raw);
    // ASSERT
    expect(parse).toThrow(message);
  });

  it('refuses a format, accent, icon or status the vocabulary does not know', () => {
    // ARRANGE
    const cases = [
      { raw: [{ ...PUBLISHED, format: 'podcast' }], message: 'ai-token-economy: format "podcast" is not one of' },
      { raw: [{ ...PUBLISHED, accent: 'beige' }], message: 'ai-token-economy: accent "beige" is not one of' },
      { raw: [{ ...PUBLISHED, icon: 'rocket' }], message: 'ai-token-economy: icon "rocket" is not one of' },
      { raw: [{ ...PUBLISHED, status: 'draft' }], message: 'ai-token-economy: status "draft" is not one of' },
    ];
    // ACT
    const parses = cases.map(
      ({ raw }) =>
        () =>
          parseEpisodeIndex(raw),
    );
    // ASSERT
    parses.forEach((parse, index) => expect(parse).toThrow(cases[index].message));
  });

  it('refuses two entries with one slug', () => {
    // ARRANGE
    const raw = [UPCOMING, { ...UPCOMING, topic: 'documentation' }];
    const message = 'duplicate slug "rolling-out-ai-in-a-team"';
    // ACT
    const parse = () => parseEpisodeIndex(raw);
    // ASSERT
    expect(parse).toThrow(message);
  });

  it('refuses a published slug that is not a registered Episode', () => {
    // ARRANGE
    const raw = [{ ...PUBLISHED, slug: 'no-such-episode' }];
    const message = 'no-such-episode: a published entry must name a registered Episode';
    // ACT
    const parse = () => parseEpisodeIndex(raw);
    // ASSERT
    expect(parse).toThrow(message);
  });

  it('refuses an upcoming slug that already is a registered Episode, or is not kebab-case', () => {
    // ARRANGE
    const registered = [{ ...UPCOMING, slug: 'ai-token-economy' }];
    const shouty = [{ ...UPCOMING, slug: 'Rolling_Out' }];
    const registeredMessage = 'ai-token-economy: an upcoming entry must not name a registered Episode';
    const shoutyMessage = 'Rolling_Out: slug must be kebab-case';
    // ACT
    const parseRegistered = () => parseEpisodeIndex(registered);
    const parseShouty = () => parseEpisodeIndex(shouty);
    // ASSERT
    expect(parseRegistered).toThrow(registeredMessage);
    expect(parseShouty).toThrow(shoutyMessage);
  });

  it('refuses a published date that is missing, malformed or not on the calendar', () => {
    // ARRANGE
    const undated = without(PUBLISHED, 'publishedOn');
    const cases = [undated, { ...PUBLISHED, publishedOn: '9 Oct 2026' }, { ...PUBLISHED, publishedOn: '2026-02-30' }];
    const message = 'ai-token-economy: publishedOn must be a calendar date';
    // ACT
    const parses = cases.map((entry) => () => parseEpisodeIndex([entry]));
    // ASSERT
    parses.forEach((parse) => expect(parse).toThrow(message));
  });

  it('refuses a published entry whose featured rank is not a positive whole number', () => {
    // ARRANGE
    const unranked = without(PUBLISHED, 'featuredRank');
    const cases = [unranked, { ...PUBLISHED, featuredRank: 0 }, { ...PUBLISHED, featuredRank: 1.5 }];
    const message = 'ai-token-economy: featuredRank must be a positive whole number';
    // ACT
    const parses = cases.map((entry) => () => parseEpisodeIndex([entry]));
    // ASSERT
    parses.forEach((parse) => expect(parse).toThrow(message));
  });

  it('refuses a field the index does not define, so no title or caption sneaks into the data', () => {
    // ARRANGE
    const raw = [{ ...UPCOMING, title: 'Rolling out AI in a team' }];
    const message = 'rolling-out-ai-in-a-team: unknown field "title"';
    // ACT
    const parse = () => parseEpisodeIndex(raw);
    // ASSERT
    expect(parse).toThrow(message);
  });

  it('refuses a date or rank on an upcoming entry', () => {
    // ARRANGE
    const raw = [{ ...UPCOMING, featuredRank: 1 }];
    const message = 'rolling-out-ai-in-a-team: unknown field "featuredRank"';
    // ACT
    const parse = () => parseEpisodeIndex(raw);
    // ASSERT
    expect(parse).toThrow(message);
  });

  it('refuses an index that is not an array, and an entry that is not an object', () => {
    // ARRANGE
    const notArray = { entries: [] };
    const notObject = ['ai-token-economy'];
    const arrayMessage = 'Episode index must be an array';
    const objectMessage = 'Episode index entry 0 must be an object';
    // ACT
    const parseArray = () => parseEpisodeIndex(notArray);
    const parseObject = () => parseEpisodeIndex(notObject);
    // ASSERT
    expect(parseArray).toThrow(arrayMessage);
    expect(parseObject).toThrow(objectMessage);
  });
});

describe('edge cases', () => {
  it('features nothing from an index that has no published Episode', () => {
    // ARRANGE
    const onlyUpcoming = filterEpisodes(INDEX, { status: 'upcoming' });
    // ACT
    const picked = featured(onlyUpcoming, 3);
    // ASSERT
    expect(picked).toEqual([]);
  });

  it('returns fewer than the limit when fewer qualify, and none for a limit of zero', () => {
    // ARRANGE
    const expectedAll = ['ai-token-economy', 'maintaining-markdown-for-ai', 'amnesiac-freelancer'];
    // ACT
    const tooMany = newest(INDEX, 10);
    const none = newest(INDEX, 0);
    // ASSERT
    expect(slugs(tooMany)).toEqual(expectedAll);
    expect(none).toEqual([]);
  });

  it('keeps every entry when a filter names nothing, and finds none for a topic nobody holds', () => {
    // ARRANGE
    const published = filterEpisodes(INDEX, { status: 'published' });
    // ACT
    const everything = filterEpisodes(INDEX, {});
    const noDocs = filterEpisodes(published, { topic: 'adoption' });
    // ASSERT
    expect(everything).toEqual(INDEX);
    expect(noDocs).toEqual([]);
  });

  it('counts and groups nothing from an empty list', () => {
    // ARRANGE
    const none: readonly EpisodeIndexEntry[] = [];
    // ACT
    const counts = [topicCounts(none), formatCounts(none), groupByTopic(none)];
    // ASSERT
    expect(counts).toEqual([[], [], []]);
  });

  it('does not reorder the list it is given', () => {
    // ARRANGE
    const before = slugs(INDEX);
    // ACT
    newest(INDEX, 3);
    featured(INDEX, 3);
    // ASSERT
    expect(slugs(INDEX)).toEqual(before);
  });

  it('reads an empty index as no entries', () => {
    // ARRANGE
    const raw: unknown[] = [];
    // ACT
    const entries = parseEpisodeIndex(raw);
    // ASSERT
    expect(entries).toEqual([]);
  });
});
