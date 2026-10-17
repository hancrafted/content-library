import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { useId } from 'react';
import styles from './grid-1x1.module.css';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The poster tile; the id labels it.
function Poster({ title, caption }: { title: string; caption: string }) {
  const id = `grid-1x1-${useId()}`;
  return (
    <article
      aria-labelledby={id}
      className={`${styles.surface} group relative isolate flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-xl border border-border p-4 shadow-sm transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none sm:p-6 md:min-h-[32rem] md:p-10`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 transition-colors duration-300 dark:group-hover:bg-foreground/6 motion-reduce:transition-none"
      />
      <span aria-hidden className="font-mono text-body tracking-[0.3em] text-muted-foreground tabular-nums">
        01 / 01
      </span>
      <div className="max-w-2xl">
        <h4 id={id} className="text-heading leading-[0.95] font-semibold tracking-tight text-balance text-foreground">
          {title}
        </h4>
        <p className="mt-4 max-w-md text-body text-pretty text-muted-foreground">{caption}</p>
      </div>
    </article>
  );
}

// One feature cell across the whole Foreground: a tall poster tile, title and caption set bottom-left over a drifting
// gradient. Hover lifts it one elevation step; the motion is CSS only, so no client widget.
export const grid1x1 = slide({
  slug: 'grid-1x1',
  messages: { en, de },
  notes: [{ slug: 'layout', target: 'grid' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target }) => (
    <SlideFrame>
      <div {...target('grid')} className="mt-10">
        <Poster title={t('cells.c1.title')} caption={t('cells.c1.caption')} />
      </div>
    </SlideFrame>
  ),
});
