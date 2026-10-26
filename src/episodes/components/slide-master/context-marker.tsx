import { ContextIcon } from '@/shared/components/ui/context-icon';
import { CONTEXT_REF_ATTR } from '@/shared/lib/context-link.pure';
import { cn } from '@/shared/lib/utils';

/*
 * Every form shares the drawer's attribute and the button's states: muted at
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

/* Beside: the same chip in the flow of a label, next to its text; `relative` from BUTTON anchors the hit area. */
const BESIDE = 'grid size-6 shrink-0 place-items-center rounded-full';

type Placement = 'inline' | 'element' | 'beside';

const FORMS: Record<Placement, string> = { inline: INLINE, element: ELEMENT, beside: BESIDE };

/** A `static` class, at any breakpoint or with `!`: it would unposition the button. */
const STATIC = /^(?:[\w@-]+:)*!?static$/;

/**
 * The placement a marker takes. The marker owns its hit area: a `static` class from a caller, at any breakpoint, is
 * dropped, because a static button would let its absolute hit area span the nearest positioned ancestor, the whole
 * Slide, and swallow every click there. An element marker asked to be static means in flow, which is `beside`. A call
 * site never needs to ask: `eslint.config.mjs` refuses `static` on a marker (design-ADR-0013).
 */
function placementOf(placement: Placement, className = ''): { placement: Placement; className: string } {
  const classes = className.split(/\s+/).filter(Boolean);
  const kept = classes.filter((name) => !STATIC.test(name));
  if (kept.length === classes.length) return { placement, className };
  return { placement: placement === 'element' ? 'beside' : placement, className: kept.join(' ') };
}

/**
 * A Context marker (design-ADR-0013): the Context drawer's speech-bubble
 * icon as a small button beside a fact, naming one Speaker note of its Slide
 * by slug, exactly as a `ContextRef` does; the drawer's delegated listener
 * opens it. `inline` sits in running text after the phrase as `(icon)`;
 * `element` (the default) sits in an element's corner, which must be
 * `relative`, or wherever the caller's `className` puts it; `beside` sits in
 * the flow of a label, next to its text. The button is always positioned, so
 * its hit area stays on it. Its accessible name is its `label`, `Speaker
 * note: <note header>`. A Slide reaches it through its kit's `marker` and
 * `Marker`.
 */
export function ContextMarker(props: { note: string; label: string; placement?: Placement; className?: string }) {
  const { placement, className } = placementOf(props.placement ?? 'element', props.className);
  const inline = placement === 'inline';
  return (
    <button
      type="button"
      {...{ [CONTEXT_REF_ATTR]: props.note }}
      aria-label={props.label}
      className={cn(BUTTON, FORMS[placement], className)}
    >
      {inline && <span aria-hidden>(</span>}
      <ContextIcon aria-hidden className={inline ? INLINE_ICON : ELEMENT_ICON} />
      {inline && <span aria-hidden>)</span>}
    </button>
  );
}
