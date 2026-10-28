import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The set-aside items, as keys of `items`, with the tilt that makes each note sit in the tray: add or drop one in both Translation files. */
const ITEMS = [
  { key: 'first', tilt: '-rotate-1' },
  { key: 'second', tilt: 'rotate-1' },
  { key: 'third', tilt: '-rotate-1' },
] as const;

// What the session leaves out: a dark "set aside" panel beside a tray of tilted notes, so the list reads as handled, not forbidden. The Slide header shows the title and caption; the Scene holds the panel and the tray.
export const outOfScope = slide({
  slug: 'out-of-scope',
  messages: { en, de },
  notes: [{ slug: 'talking-points', target: 'items' }],
  content: ({ t, target }) => (
    <SlideFrame className="justify-center">
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-12">
        <div className="flex flex-col justify-center gap-4 rounded-3xl bg-primary p-8 text-primary-foreground md:col-span-4">
          <svg viewBox="0 0 48 48" className="size-14" aria-hidden="true">
            <path d="M6 20h36l-4 20H10z" className="fill-brand-accent" />
            <path
              d="M6 20l6-10h24l6 10"
              className="fill-none stroke-primary-foreground"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M18 28h12" className="fill-none stroke-primary" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p className="text-subheading font-semibold">{t('panel.title')}</p>
          <p className="text-body">{t('panel.line')}</p>
        </div>
        <ul
          {...target('items')}
          data-workshop-items=""
          className="focus-group focus-group--dim-others flex flex-col gap-4 rounded-3xl border border-border bg-muted p-6 md:col-span-8"
        >
          {ITEMS.map(({ key, tilt }) => (
            <li
              key={key}
              className={`focus-group__item card-hover card-hover--raise flex items-center gap-5 rounded-2xl border border-(--warning)/50 bg-(--warning)/20 p-5 shadow-md ${tilt}`}
            >
              <span
                aria-hidden="true"
                className="flex size-12 flex-none items-center justify-center rounded-full bg-(--warning) text-subheading font-semibold text-warning-foreground"
              >
                ×
              </span>
              <div>
                <p className="text-subheading font-semibold">{t(`items.${key}.title`)}</p>
                <p className="text-body text-muted-foreground">{t(`items.${key}.reason`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SlideFrame>
  ),
});
