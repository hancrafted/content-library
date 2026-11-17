import { ContextIcon } from '@/shared/components/ui/context-icon';
import { CONTEXT_REF_ATTR } from '@/shared/lib/context-link.pure';
import { cn } from '@/shared/lib/utils';

const BUTTON =
  "relative cursor-pointer rounded-sm text-muted-foreground transition-colors after:absolute after:-inset-1.5 after:content-[''] hover:bg-accent hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none print:hidden";

const INLINE = 'inline p-0 align-baseline whitespace-nowrap [font:inherit]';
const INLINE_ICON = 'inline-block size-[0.9em] align-[-0.1em]';

const ELEMENT = 'absolute top-2 right-2 grid size-6 place-items-center rounded-full';
const ELEMENT_ICON = 'size-3.5';

const BESIDE = 'grid size-6 shrink-0 place-items-center rounded-full';

type Placement = 'inline' | 'element' | 'beside';

const FORMS: Record<Placement, string> = { inline: INLINE, element: ELEMENT, beside: BESIDE };

const STATIC = /^(?:[\w@-]+:)*!?static$/;

// decision: docs/adr/0013-context-markers.md
function placementOf(placement: Placement, className = ''): { placement: Placement; className: string } {
  const classes = className.split(/\s+/).filter(Boolean);
  const kept = classes.filter((name) => !STATIC.test(name));
  if (kept.length === classes.length) return { placement, className };
  return { placement: placement === 'element' ? 'beside' : placement, className: kept.join(' ') };
}

// decision: docs/adr/0013-context-markers.md
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
