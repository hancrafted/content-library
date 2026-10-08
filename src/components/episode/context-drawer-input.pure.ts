import type { ContextItem } from '@/components/context-drawer/context-drawer-input';
import { checkContext } from '../../lib/context-check.pure';
import { sectionAnchor, slideAnchor, targetAnchor, titleAnchor } from '../../lib/episode.pure';
import type { EpisodeSection, EpisodeSlide } from './episode-page-container.pure';

/*
 * THE SEAM. This file and `context-drawer-input.ts` are the only place the
 * Context drawer meets an Episode record. They turn Sections and Slides into
 * `ContextItem`s: item id = the Slide's anchor (the id its wrapper carries),
 * note target = the full element id. A Slide-registration contract replaces
 * these two files; the drawer itself is untouched (FE-010 §8).
 */

function itemOf(id: string, slide: EpisodeSlide): ContextItem {
  const notes = slide.notes ?? [];
  const script = slide.voiceScript ?? [];
  checkContext(id, notes, script);
  return {
    id,
    title: slide.title,
    notes: notes.map((note) => ({ ...note, target: targetAnchor(id, note.target) })),
    script,
  };
}

/**
 * The Title slide's item: no notes, no script, and the explainer of how the
 * drawer works, which the drawer shows on both tabs (FE-010).
 */
function titleItem(explainer: string): ContextItem {
  return { id: titleAnchor(), notes: [], script: [], explainer };
}

/**
 * The Title slide's item, then one item per section slide and page Slide in
 * page order (the order the table of contents lists). Each note's `target` is resolved to the full id its
 * Slide's markup carries. Throws on a malformed Slide, so a broken Episode
 * fails `next dev` and the static build alike.
 */
export function contextItemsOf(sections: readonly EpisodeSection[], explainer: string): ContextItem[] {
  return [
    titleItem(explainer),
    ...sections.flatMap((section) => [
      itemOf(sectionAnchor(section.slug), section),
      ...section.slides.map((slide) => itemOf(slideAnchor(section.slug, slide.slug), slide)),
    ]),
  ];
}
