import type { SlideLevel } from '@/lib/episode.pure';
import type { ReactNode } from 'react';
import { ContextRef } from './context-ref';
import type { RuntimeKit, RuntimeTranslator } from './episode-record';
import { SlideTitle } from './slide-master';

/** What the container knows about one placed Slide when it builds its kit. */
export interface KitInput {
  readonly t: RuntimeTranslator;
  /** From the Slide's position: `h2` opens a Section, `h3` follows (FE-002 §4). */
  readonly level: SlideLevel;
  /** The slugs of the notes the Slide declares; `ref` takes only these. */
  readonly notes: readonly string[];
  /** Said after a Context reference's phrase, e.g. `opens speaker note`. */
  readonly refLabel: string;
  /** The Slide's id, named in the error a bad `ref` throws. */
  readonly slide: string;
}

/**
 * The kit a Slide's `content` receives (FE-002 §3). `Title` is the Slide's
 * heading at the level its position gives it, marked as the `title` target;
 * `ref` wraps a phrase as a Context reference to one of the Slide's notes;
 * `target` marks the element a note explains. The types already confine
 * `ref` and `target` to declared names; `ref` checks again at render, so a
 * cast in a Slide still fails the build.
 */
export function slideKit({ t, level, notes, refLabel, slide }: KitInput): RuntimeKit {
  const Title = ({ children }: { children: ReactNode }) => (
    <SlideTitle as={level} data-target="title">
      {children}
    </SlideTitle>
  );
  const ref = (note: string) => {
    if (!notes.includes(note)) {
      throw new Error(`No note "${note}" on "${slide}": a context reference must name one of its notes.`);
    }
    return (chunks: ReactNode) => (
      <ContextRef note={note} label={refLabel}>
        {chunks}
      </ContextRef>
    );
  };
  return { t, ref, target: (name) => ({ 'data-target': name }), Title };
}
