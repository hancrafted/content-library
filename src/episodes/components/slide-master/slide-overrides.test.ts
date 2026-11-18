import { instanceOf } from '@/episodes/lib/episode-instance';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { localizeSlide, type EpisodeContext } from './localized-slide';
import { slide, type Slide } from './slide';
import type { RuntimeKit } from './slide-base';

declare module '@/episodes/lib/episode-instance' {
  interface BaseSlideMessages {
    'episode-instance-kit': {
      readonly chapter: {
        readonly en: { readonly title: string };
        readonly de: { readonly title: string };
      };
      readonly fixture: {
        readonly en: { readonly title: string };
        readonly de: { readonly title: string };
        readonly targets: 'team' | 'quote';
        readonly explorables: 'context';
      };
    };
  }
}

const NOTE = { header: 'Header', description: 'Description' };
const FIXTURE_TEXT = (title: string) => ({ title, notes: { team: NOTE, quote: NOTE } });
const CHAPTER = slide({
  slug: 'chapter',
  messages: { en: { title: 'Chapter' }, de: { title: 'Kapitel' } },
  content: (kit) => kit as never as ReactNode,
});
const FIXTURE = slide({
  slug: 'fixture',
  messages: { en: FIXTURE_TEXT('Fixture'), de: FIXTURE_TEXT('Vorlage') },
  notes: [
    { slug: 'team', target: 'team' },
    { slug: 'quote', target: 'quote' },
  ],
  explorables: { context: 'slide-5' },
  content: ({ target, explorables }) =>
    ({ team: target('team'), quote: target('quote'), preset: explorables.context }) as never as ReactNode,
});

const BASE = {
  slug: 'episode-instance-kit' as const,
  messages: { en: { title: 'Kit' }, de: { title: 'Kit' } },
  sections: [[CHAPTER, FIXTURE] as const],
};

interface Shown {
  team: ReturnType<RuntimeKit['target']>;
  quote: ReturnType<RuntimeKit['target']>;
  preset: string;
}

function resolved(instance: typeof BASE): Shown {
  const sections = instance.sections as unknown as readonly (readonly [Slide, ...Slide[]])[];
  const episode: EpisodeContext = {
    episode: 'ai-token-economy',
    locale: 'en',
    placed: placeSections<Slide>(sections).flat(),
    referenceLabels: { ref: 'opens', marker: (title) => title },
    header: 'authored',
  };
  const placed = episode.placed.find(({ slide: each }) => each.slug === 'fixture');
  if (placed === undefined) throw new Error('no fixture Slide');
  return localizeSlide(placed as never, episode).content as unknown as Shown;
}

describe('success cases', () => {
  it('hides the named target and swaps the Preset id, leaving the other target alone', () => {
    // ARRANGE
    const expected = {
      team: { 'data-target': 'team', hidden: true },
      quote: { 'data-target': 'quote' },
      preset: 'slide-7',
    };
    // ACT
    const instance = instanceOf(BASE, { slides: { fixture: { hide: ['team'], explorables: { context: 'slide-7' } } } });
    // ASSERT
    expect(resolved(instance)).toEqual(expected);
  });

  it('shows the base defaults when nothing is overridden', () => {
    // ARRANGE
    const expected = { team: { 'data-target': 'team' }, quote: { 'data-target': 'quote' }, preset: 'slide-5' };
    // ACT
    const shown = resolved(instanceOf(BASE, {}));
    // ASSERT
    expect(shown).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('makes an unknown target name or Preset id a compile error', () => {
    // ARRANGE
    const expected = 'function';
    // ACT
    const typed = () => [
      // @ts-expect-error
      instanceOf(BASE, { slides: { fixture: { hide: ['nope'] } } }),
      // @ts-expect-error
      instanceOf(BASE, { slides: { fixture: { explorables: { context: 'slide-99' } } } }),
      // @ts-expect-error
      instanceOf(BASE, { slides: { fixture: { explorables: { aiCapability: 'timeline' } } } }),
      // @ts-expect-error
      instanceOf(BASE, { slides: { chapter: { hide: ['team'] } } }),
    ];
    // ASSERT
    expect(typed).toBeTypeOf(expected);
  });

  it('refuses at runtime a target the Slide does not expose and an Explorable it does not declare', () => {
    // ARRANGE
    const expected = [
      'Slide "fixture" exposes no target "nope" to hide',
      'Slide "fixture" declares no Explorable "aiCapability" to swap a Preset of',
    ];
    // ACT
    const failures = [
      () => instanceOf(BASE, { slides: { fixture: { hide: ['nope' as never] } } }),
      () => instanceOf(BASE, { slides: { fixture: { explorables: { aiCapability: 'timeline' } as never } } }),
    ].map((run) => {
      try {
        run();
        return 'no error';
      } catch (error) {
        return (error as Error).message;
      }
    });
    // ASSERT
    expect(failures).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('adds up the hidden targets of two layers, and keeps the earlier Preset swap the later layer leaves alone', () => {
    // ARRANGE
    const first = instanceOf(BASE, { slides: { fixture: { hide: ['team'], explorables: { context: 'slide-7' } } } });
    const expected = {
      team: { 'data-target': 'team', hidden: true },
      quote: { 'data-target': 'quote', hidden: true },
      preset: 'slide-7',
    };
    // ACT
    const both = instanceOf(first, { slides: { fixture: { hide: ['quote'] } } });
    // ASSERT
    expect(resolved(both)).toEqual(expected);
  });
});
