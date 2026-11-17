import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Context } from '@/explorables/context-window/context';
import { DefinitionCards } from './definition-cards';
import de from './i18n/de.json';
import en from './i18n/en.json';

const MESSAGES_API = { slug: 'anthropic-messages-api', url: 'https://platform.claude.com/docs/en/api/messages' };
const CONTEXT_WINDOWS = {
  slug: 'anthropic-context-windows',
  url: 'https://platform.claude.com/docs/en/build-with-claude/context-windows',
};

/**
 * "The context window" (Spec Option 3a): the reveal. The live cornerstone in its Slide 3 Preset (conversation, timeline
 * and context, the budget message pinned, no Technical toggle) and three definition cards under it, the limit lit.
 * Keeps `basic-page` and `motion: local`: the cornerstone's own step motion is the only motion.
 */
export const theContextWindow = slide({
  slug: 'the-context-window',
  messages: { en, de },
  notes: [
    { slug: 'the-model-keeps-nothing', target: 'resend', sources: [MESSAGES_API] },
    { slug: 'replies-feed-back-in', target: 'resend', sources: [CONTEXT_WINDOWS] },
    { slug: 'both-directions-count', target: 'limit', sources: [CONTEXT_WINDOWS] },
    { slug: 'apps-may-differ', target: 'apps', sources: [CONTEXT_WINDOWS] },
  ],
  segments: [
    { slug: 'you-type-one-line' },
    { slug: 'there-is-a-size-limit' },
    { slug: 'the-term-to-keep' },
    { slug: 'context-engineering' },
  ],
  content: ({ t, locale, marker, Marker }) => (
    <SlideFrame className="mt-8 gap-10">
      <Context preset="slide-3" locale={locale} />
      <DefinitionCards
        items={[
          {
            name: 'resend',
            kicker: t('cards.resend.kicker'),
            body: t.rich('cards.resend.body', {
              keeps: marker('the-model-keeps-nothing'),
              replies: marker('replies-feed-back-in'),
            }),
          },
          {
            name: 'limit',
            lit: true,
            kicker: (
              <>
                {t('cards.limit.kicker')}
                <Marker note="both-directions-count" placement="beside" />
              </>
            ),
            body: t.rich('cards.limit.body'),
          },
          {
            name: 'apps',
            kicker: t('cards.apps.kicker'),
            body: t.rich('cards.apps.body', { marker: marker('apps-may-differ') }),
            aside: (
              <span className="self-start rounded-full border border-dashed border-border px-2 py-0.5 text-caption text-muted-foreground">
                {t('illustrative')}
              </span>
            ),
          },
        ]}
      />
    </SlideFrame>
  ),
});
