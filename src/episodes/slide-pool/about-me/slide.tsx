import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { externalHref } from '@/shared/lib/external-link.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The facts' keys and the colour of each number disc: structure only, in the order they read. */
const FACTS = [
  { key: 'f1', disc: 'bg-(--info) text-info-foreground' },
  { key: 'f2', disc: 'bg-brand-accent text-primary-foreground' },
  { key: 'f3', disc: 'bg-human text-secondary-foreground' },
] as const;

/**
 * Who is talking (a pool Slide: the Workshop template and every Event copy compose it as it is): a portrait stage
 * against a numbered rail of three facts, and the one link. The portrait is a monogram until a photo arrives; the role
 * and the facts are placeholders the presenter fills in `i18n/`, so no claim here is sourced.
 */
export const aboutMe = slide({
  slug: 'about-me',
  messages: { en, de },
  notes: [{ slug: 'bio', target: 'facts' }],
  content: ({ t, target }) => (
    <SlideFrame className="justify-center">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <div
          className="flex min-h-64 items-center justify-center rounded-xl bg-linear-to-br from-human/30 via-(--info)/15 to-brand-accent/20 md:col-span-5 md:min-h-96"
          aria-hidden="true"
        >
          <div className="flex size-44 items-center justify-center rounded-full border-4 border-card bg-human text-heading font-semibold text-secondary-foreground shadow-lg">
            {t('aboutMe.initials')}
          </div>
        </div>
        <div className="flex flex-col justify-center gap-6 md:col-span-7">
          <div>
            <p className="text-heading font-semibold">{t('aboutMe.name')}</p>
            <p className="mt-2 inline-block rounded-full bg-human/10 px-4 py-1.5 text-body font-medium text-human">
              {t('aboutMe.role')}
            </p>
          </div>
          <ol {...target('facts')} className="flex flex-col gap-3">
            {FACTS.map(({ key, disc }, index) => (
              <li key={key} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full text-body font-semibold ${disc}`}
                >
                  {index + 1}
                </span>
                <p className="text-body font-medium">{t(`aboutMe.facts.${key}`)}</p>
              </li>
            ))}
          </ol>
          <p>
            <a
              href={externalHref(t('aboutMe.linkHref'))}
              target="_blank"
              rel="noopener noreferrer"
              className="card-hover card-hover--raise inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-body font-semibold text-primary-foreground shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {t('aboutMe.linkLabel')}
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                <path
                  d="M7 17 17 7M9 7h8v8"
                  className="fill-none stroke-current"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="sr-only"> ({t('aboutMe.newTabHint')})</span>
            </a>
          </p>
        </div>
      </div>
    </SlideFrame>
  ),
});
