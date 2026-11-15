import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { cn } from '@/shared/lib/utils';
import { type Facet } from './room-art';
import styles from './slide.module.css';

/*
 * The manual's binder lifted from the approved Spec's Option 11a (feedback 3, decision 46): its green cover with the
 * rings, and the index page's faceted paper, each stretched to the HTML box it backs, so the index keeps real text.
 */

const BINDER: readonly Facet[] = [
  ['book-lit', 'M640 46L948 46L640 486Z'],
  ['book', 'M948 46L948 486L640 486Z'],
  ['book-shade', 'M640 472L948 472L948 486L640 486Z'],
  ['ring-metal', 'M695 36L709 36L709 68L695 68Z'],
  ['glint', 'M695 36L702 36L695 68Z'],
  ['ring-metal', 'M756 36L770 36L770 68L756 68Z'],
  ['glint', 'M756 36L763 36L756 68Z'],
  ['ring-metal', 'M818 36L832 36L832 68L818 68Z'],
  ['glint', 'M818 36L825 36L818 68Z'],
  ['ring-metal', 'M879 36L893 36L893 68L879 68Z'],
  ['glint', 'M879 36L886 36L879 68Z'],
];

const PAPER: readonly Facet[] = [
  ['paper', 'M936 188L822 62L936 62Z'],
  ['paper-lit', 'M822 62L936 188L823 277Z'],
  ['paper', 'M652 332L776 464L652 464Z'],
  ['paper-shade', 'M776 464L652 332L823 277Z'],
  ['paper', 'M936 188L936 339L823 277Z'],
  ['paper-lit', 'M776 464L936 339L936 464Z'],
  ['paper-shade', 'M936 339L776 464L823 277Z'],
  ['paper-lit', 'M652 332L652 168L823 277Z'],
  ['paper', 'M822 62L652 168L652 62Z'],
  ['paper-lit', 'M652 168L822 62L823 277Z'],
];

/** The binder's green cover and its rings, stretched to the index it holds. */
export function BinderCover() {
  return (
    <svg
      aria-hidden
      viewBox="640 36 308 450"
      preserveAspectRatio="none"
      className={cn(styles.art, 'pointer-events-none absolute inset-0 size-full')}
    >
      <ToneFacets facets={BINDER} />
    </svg>
  );
}

/** The index page's faceted paper, stretched to the page. */
export function PaperFacets() {
  return (
    <svg
      aria-hidden
      viewBox="652 62 284 402"
      preserveAspectRatio="none"
      className={cn(styles.art, 'pointer-events-none absolute inset-0 size-full')}
    >
      <ToneFacets facets={PAPER} />
    </svg>
  );
}
