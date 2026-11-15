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
  ['ring-metal', 'M694.6 36L708.6 36L708.6 68L694.6 68Z'],
  ['glint', 'M694.6 36L701.6 36L694.6 68Z'],
  ['ring-metal', 'M756.2 36L770.2 36L770.2 68L756.2 68Z'],
  ['glint', 'M756.2 36L763.2 36L756.2 68Z'],
  ['ring-metal', 'M817.8 36L831.8 36L831.8 68L817.8 68Z'],
  ['glint', 'M817.8 36L824.8 36L817.8 68Z'],
  ['ring-metal', 'M879.4 36L893.4 36L893.4 68L879.4 68Z'],
  ['glint', 'M879.4 36L886.4 36L879.4 68Z'],
];

const PAPER: readonly Facet[] = [
  ['paper', 'M936 188L821.9 62L936 62Z'],
  ['paper-lit', 'M821.9 62L936 188L823.1 276.7Z'],
  ['paper', 'M652 331.6L775.9 464L652 464Z'],
  ['paper-shade', 'M775.9 464L652 331.6L823.1 276.7Z'],
  ['paper', 'M936 188L936 339.1L823.1 276.7Z'],
  ['paper-lit', 'M775.9 464L936 339.1L936 464Z'],
  ['paper-shade', 'M936 339.1L775.9 464L823.1 276.7Z'],
  ['paper-lit', 'M652 331.6L652 167.6L823.1 276.7Z'],
  ['paper', 'M821.9 62L652 167.6L652 62Z'],
  ['paper-lit', 'M652 167.6L821.9 62L823.1 276.7Z'],
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
