import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { Context } from '@/explorable-explanations/context/context';
import { ExplainCard, NamedList } from './explain-cards';
import de from './i18n/de.json';
import en from './i18n/en.json';

const source = (slug: string, url: string) => ({ slug, url });
const MEMORY_RESEARCH = source(
  'han-llm-memory-between-chats',
  'https://github.com/hancrafted/content-library/blob/main/docs/llm-wiki/research/LLM/LLM-0003__llm-memory-between-chats/research.md',
);
const CLAUDE_CODE_MEMORY = source('anthropic-claude-code-memory', 'https://code.claude.com/docs/en/memory');
const CLAUDE_CHAT_MEMORY = source(
  'anthropic-chat-search-and-memory',
  'https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-conversations',
);
const GEMINI_MEMORY = source('google-gemini-memory', 'https://support.google.com/gemini/answer/16598625');
const CHATGPT_MEMORY = source('openai-chatgpt-memory', 'https://help.openai.com/en/articles/8590148-memory-faq');

/** The parts the Slide names without explaining, in the order the dashed box lists them. */
const NAMED = ['files', 'web', 'tools', 'reminders'] as const;

/**
 * "What's really in the context window" (Spec Option 7a, Han's batch-2 item 8): the cornerstone on its Slide 7 parts
 * Preset, Simple at rest, without chat or timeline: the context window, the context category and the details, the
 * starting instructions pinned, the window and the category each with their own local </>; under it two plain-word cards for the only parts explained,
 * starting instructions and memory, and a dashed box naming the rest. Keeps `basic-page` and `motion: local`: the
 * component lights its own parts, the cards only raise on hover.
 */
export const whatsReallyInTheWindow = slide({
  slug: 'whats-really-in-the-window',
  messages: { en, de },
  notes: [
    { slug: 'nothing-carries-over-by-itself', target: 'memory', sources: [MEMORY_RESEARCH] },
    { slug: 'documented-for-claude-code', target: 'start', sources: [CLAUDE_CODE_MEMORY] },
    { slug: 'loading-has-a-cost', target: 'start', sources: [CLAUDE_CODE_MEMORY] },
    { slug: 'chat-apps-document-the-effect', target: 'memory', sources: [CLAUDE_CHAT_MEMORY, GEMINI_MEMORY] },
    { slug: 'not-every-feature-preloads', target: 'named', sources: [CLAUDE_CHAT_MEMORY, CHATGPT_MEMORY] },
  ],
  segments: [
    { slug: 'more-than-the-chat' },
    { slug: 'starting-instructions' },
    { slug: 'memory' },
    { slug: 'the-rest' },
  ],
  content: ({ t, locale, marker, target }) => (
    <SlideFrame className="gap-6">
      <div className="flex justify-end">
        <span className="rounded-full border border-border px-2 py-0.5 text-caption text-muted-foreground">
          {t('illustrative')}
        </span>
      </div>
      <Context preset="slide-7-parts" locale={locale} />
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
        <ExplainCard
          swatch="start"
          title={t('cards.start.title')}
          lead={t.rich('cards.start.lead', { marker: marker('documented-for-claude-code') })}
          more={t.rich('cards.start.cost', { marker: marker('loading-has-a-cost') })}
          target={target('start')}
        />
        <ExplainCard
          swatch="memory"
          title={t('cards.memory.title')}
          lead={t.rich('cards.memory.lead', { marker: marker('nothing-carries-over-by-itself') })}
          more={t.rich('cards.memory.apps', { marker: marker('chat-apps-document-the-effect') })}
          target={target('memory')}
        />
        <NamedList
          heading={t('named.heading')}
          items={NAMED.map((item) => t(`named.items.${item}`))}
          pastChats={t.rich('named.pastChats', { marker: marker('not-every-feature-preloads') })}
          target={target('named')}
        />
      </div>
    </SlideFrame>
  ),
});
