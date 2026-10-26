import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { Context } from '@/explorable-explanations/context/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

const source = (slug: string, url: string) => ({ slug, url });
const USAGE_LIMITS = source(
  'anthropic-usage-and-length-limits',
  'https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work',
);
const CONTEXT_ENGINEERING = source(
  'anthropic-context-engineering',
  'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
);
const CONTEXT_WINDOWS = source(
  'anthropic-context-windows',
  'https://platform.claude.com/docs/en/build-with-claude/context-windows',
);
const OPENAI_COMPACTION = source('openai-compaction', 'https://developers.openai.com/api/docs/guides/compaction');

/** A Context marker on the primary callout: muted on primary at rest, the marker's own hover colours after. */
const ON_PRIMARY = 'text-primary-foreground/70 hover:text-foreground focus-visible:text-foreground';

/**
 * "You can't watch the meter" (Spec Option 9b): compaction as a before and after in three locked mounts of the
 * cornerstone, the bar at step 23 with the fill in the space kept free for summaries, the chat alone, and the bar
 * at step 24 with the summary pinned; under them the caveat footer and the callout Han asked for. Keeps
 * `basic-page`; overrules `motion: local` to none, since both bars are end states.
 */
export const youCantWatchTheMeter = slide({
  slug: 'you-cant-watch-the-meter',
  messages: { en, de },
  notes: [
    { slug: 'documented-for-claude', target: 'after', sources: [USAGE_LIMITS] },
    { slug: 'the-only-sign', target: 'footer', sources: [USAGE_LIMITS] },
    { slug: 'full-history-is-kept', target: 'chat', sources: [USAGE_LIMITS] },
    { slug: 'a-summary-can-lose-things', target: 'after', sources: [CONTEXT_ENGINEERING] },
    { slug: 'other-apps-are-unknown', target: 'footer', sources: [CONTEXT_WINDOWS, OPENAI_COMPACTION] },
  ],
  segments: [
    { slug: 'her-own-notes' },
    { slug: 'the-app-does-something-like-it' },
    { slug: 'you-cant-watch-the-meter' },
    { slug: 'why-the-budget-survived' },
  ],
  content: ({ t, locale, marker, target }) => (
    <SlideFrame className="mt-8 gap-6">
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-3 md:col-span-3">
          <p className="text-caption font-semibold">{t('before')}</p>
          <Context preset="slide-9-before" locale={locale} />
          <p className="text-caption text-muted-foreground">{t('bufferNote')}</p>
        </div>
        <div {...target('chat')} className="flex min-w-0 flex-col gap-3 md:col-span-6">
          <p className="text-caption text-muted-foreground">
            {t.rich('chatNote', { marker: marker('full-history-is-kept') })}
          </p>
          <Context preset="slide-9-chat" locale={locale} />
        </div>
        <div {...target('after')} className="flex min-w-0 flex-col gap-3 md:col-span-3">
          <p className="text-caption font-semibold">{t('after')}</p>
          <Context preset="slide-9-after" locale={locale} />
          <p className="text-caption text-muted-foreground">
            {t.rich('summaryNote', {
              documented: marker('documented-for-claude'),
              lose: marker('a-summary-can-lose-things'),
            })}
          </p>
        </div>
      </div>
      <div
        {...target('footer')}
        className="flex flex-col gap-2 text-caption text-muted-foreground md:flex-row md:items-center md:justify-between md:gap-6"
      >
        <span>{t.rich('footer.sign', { marker: marker('the-only-sign') })}</span>
        <span>{t.rich('footer.otherApps', { marker: marker('other-apps-are-unknown') })}</span>
      </div>
      <div className="rounded-xl bg-primary p-6 text-primary-foreground shadow-md">
        <p className="text-subheading font-semibold">{t('callout.heading')}</p>
        <p className="text-body">
          {t.rich('callout.body', {
            documented: marker('documented-for-claude', ON_PRIMARY),
            unknown: marker('other-apps-are-unknown', ON_PRIMARY),
          })}
        </p>
      </div>
    </SlideFrame>
  ),
});
