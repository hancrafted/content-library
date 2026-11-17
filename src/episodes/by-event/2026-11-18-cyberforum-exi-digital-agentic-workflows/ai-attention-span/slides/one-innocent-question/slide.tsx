import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Context } from '@/explorables/context-window/context';
import { contextData } from '@/explorables/context-window/context-data';
import { shortTokens } from '@/explorables/context-window/context-format.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { JumpCard, SizeBars, type BarTone } from './jump-parts';
import { SIZE_ROWS, sizeBars } from './size-bars.pure';

const source = (slug: string, url: string) => ({ slug, url });
const WEB_SEARCH = source(
  'anthropic-web-search-tool',
  'https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool',
);
const WEB_FETCH = source(
  'anthropic-web-fetch-tool',
  'https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool',
);
const OPENAI_WEB_SEARCH = source('openai-web-search', 'https://developers.openai.com/api/docs/guides/tools-web-search');

/** Each row's colour: what you typed, what the AI wrote, what it searched and what it read. */
const TONES: Readonly<Record<(typeof SIZE_ROWS)[number]['key'], BarTone>> = {
  question: 'you',
  searches: 'searched',
  pdf: 'read',
  answer: 'ai',
};

/**
 * "One innocent question" (Spec Option 8a): the cornerstone on its Slide 8 Preset, Technical, one step on so the
 * one-line answer shows, the catering PDF read pinned, the conversation off and the panel open; below, a card in
 * plain words and size bars on one scale. The bars read the same chat the cornerstone draws, so their numbers agree
 * with it. Keeps `basic-page` and `motion: local`.
 */
export const oneInnocentQuestion = slide({
  slug: 'one-innocent-question',
  messages: { en, de },
  notes: [
    { slug: 'everything-is-loaded', target: 'card', sources: [WEB_SEARCH] },
    { slug: 'it-stays', target: 'card', sources: [WEB_SEARCH] },
    { slug: 'a-pdf-is-the-big-bite', target: 'card', sources: [WEB_FETCH] },
    { slug: 'the-remedy', target: 'sizes', sources: [WEB_FETCH, OPENAI_WEB_SEARCH] },
    { slug: 'api-figures-not-app-figures', target: 'illustrative', sources: [WEB_SEARCH] },
  ],
  segments: [
    { slug: 'three-venues' },
    { slug: 'what-you-dont-see' },
    { slug: 'the-catering-pdf' },
    { slug: 'the-intern' },
    { slug: 'a-big-bite' },
  ],
  content: ({ t, locale, marker, target }) => {
    const chat = contextData(locale).chats['summer-party'];
    const bars = chat ? sizeBars(chat, SIZE_ROWS) : [];
    return (
      <SlideFrame className="gap-6">
        <div className="flex justify-end">
          <span
            {...target('illustrative')}
            className="rounded-full border border-border px-2 py-0.5 text-caption text-muted-foreground"
          >
            {t.rich('illustrative', { marker: marker('api-figures-not-app-figures') })}
          </span>
        </div>
        <Context preset="slide-8" locale={locale} />
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
          <JumpCard
            title={t('card.title')}
            lead={t.rich('card.lead', { marker: marker('a-pdf-is-the-big-bite') })}
            more={t.rich('card.more', {
              loaded: marker('everything-is-loaded'),
              stays: marker('it-stays'),
            })}
            target={target('card')}
          />
          <SizeBars
            heading={t('sizes.heading')}
            label={t('sizes.label')}
            rows={bars.map((bar) => ({
              key: bar.key,
              label: t(`sizes.${bar.key}`),
              value: shortTokens(bar.tokens, locale),
              percent: bar.percent,
              tone: TONES[bar.key],
            }))}
            target={target('sizes')}
          />
        </div>
      </SlideFrame>
    );
  },
});
