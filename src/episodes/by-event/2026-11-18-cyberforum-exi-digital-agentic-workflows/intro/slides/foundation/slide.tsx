import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { localizePath } from '@/shared/lib/locale.pure';
import { ROUTES } from '@/shared/lib/static-routes';
import de from './i18n/de.json';
import en from './i18n/en.json';

const EPISODES = [
  { slug: 'ai-attention-span', today: true, context: true },
  { slug: 'onboard-ai-every-time', today: true, context: true },
  { slug: 'ai-gives-you-more-work', today: true, context: false },
  { slug: 'from-shared-understanding-to-shared-context', today: false, context: true },
  { slug: 'what-lies-below-the-waterline-of-sustainable-ai-skills', today: false, context: true },
  { slug: 'what-agentic-workflows-require', today: false, context: true },
] as const;

export const foundation = slide({
  slug: 'foundation',
  messages: { en, de },
  notes: [{ slug: 'talking-points', target: 'episodes' }],
  content: ({ t, locale, target }) => (
    <SlideFrame className="justify-center">
      <ul {...target('episodes')} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EPISODES.map(({ slug, today, context }) => (
          <li key={slug} className="flex">
            <a
              href={localizePath(`${ROUTES.episodes}/${slug}`, locale)}
              target="_blank"
              rel="noopener noreferrer"
              data-episode-card={slug}
              className={`flex flex-1 flex-col gap-2 rounded-xl border bg-card p-5 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent ${today ? 'border-brand-accent/50' : 'border-border'}`}
            >
              <span className="flex min-h-7 flex-wrap gap-2">
                {today && (
                  <span className="rounded-full bg-brand-accent/15 px-2.5 py-0.5 text-caption font-semibold tracking-wide text-brand-accent uppercase">
                    {t('today')}
                  </span>
                )}
                {context && (
                  <span className="rounded-full border border-(--info)/45 px-2.5 py-0.5 text-caption font-semibold text-(--info)">
                    {t('context')}
                  </span>
                )}
              </span>
              <span className="text-body font-semibold text-balance">{t(`episodes.${slug}.title`)}</span>
              <span className="text-caption text-muted-foreground">{t(`episodes.${slug}.body`)}</span>
              <span className="mt-auto pt-2 text-caption font-semibold text-(--info)">
                {t('watch')} <span aria-hidden="true">↗</span>
                <span className="sr-only"> ({t('newTabHint')})</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </SlideFrame>
  ),
});
