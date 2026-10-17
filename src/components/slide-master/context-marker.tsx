import { ContextIcon } from '@/components/ui/context-icon';
import { CONTEXT_REF_ATTR } from '@/lib/context-link.pure';
import { cn } from '@/lib/utils';

/*
 * Both forms share the drawer's attribute and the button's states: muted at
 * rest, foreground and accent on hover, a ring on keyboard focus only. The hit
 * area grows by a pseudo-element, which takes no layout space. Print drops the
 * marker; an element marker is out of flow, so nothing moves.
 */
const BUTTON =
  "relative cursor-pointer rounded-sm text-muted-foreground transition-colors after:absolute after:-inset-1.5 after:content-[''] hover:bg-accent hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none print:hidden";

/* Inline: the icon at text size, in parentheses, on the baseline, so the line keeps its height. */
const INLINE = 'inline p-0 align-baseline whitespace-nowrap [font:inherit]';
const INLINE_ICON = 'inline-block size-[0.9em] align-[-0.1em]';

/* Element: a round chip in the element's top-right corner, unless the caller places it. */
const ELEMENT = 'absolute top-2 right-2 grid size-6 place-items-center rounded-full';
const ELEMENT_ICON = 'size-3.5';

/**
 * A Context marker (FE-012): the Context drawer's speech-bubble
 * icon as a small button beside a fact, naming one Speaker note of its Slide
 * by slug, exactly as a `ContextRef` does; the drawer's delegated listener
 * opens it. `inline` sits in running text after the phrase as `(icon)`;
 * `element` (the default) sits in an element's corner, which must be
 * `relative`, or wherever the caller's `className` puts it, e.g. `static ml-1`
 * beside a label. Its accessible name is its `label`, `Speaker note: <note
 * header>`. A Slide reaches it through its kit's `marker` and `Marker`.
 */
export function ContextMarker(props: {
  note: string;
  label: string;
  placement?: 'inline' | 'element';
  className?: string;
}) {
  const inline = props.placement === 'inline';
  return (
    <button
      type="button"
      {...{ [CONTEXT_REF_ATTR]: props.note }}
      aria-label={props.label}
      className={cn(BUTTON, inline ? INLINE : ELEMENT, props.className)}
    >
      {inline && <span aria-hidden>(</span>}
      <ContextIcon aria-hidden className={inline ? INLINE_ICON : ELEMENT_ICON} />
      {inline && <span aria-hidden>)</span>}
    </button>
  );
}
