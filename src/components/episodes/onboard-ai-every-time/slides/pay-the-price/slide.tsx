import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { PriceMirror } from './price-mirror';
import { TRAITS } from './trait-flip.pure';

const source = (slug: string, url: string) => ({ slug, url });
const LIGHTMAN = source('lightman-verify-step-by-step', 'https://arxiv.org/abs/2305.20050');
const HOLTZMAN = source('holtzman-text-degeneration', 'https://arxiv.org/abs/1904.09751');
const MESSAGES_API = source('anthropic-messages-api', 'https://platform.claude.com/docs/en/api/messages');
const HE = source(
  'he-defeating-nondeterminism',
  'https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/',
);
const ATIL = source('atil-deterministic-settings', 'https://arxiv.org/abs/2408.04667');
const CONTEXT_WINDOWS = source(
  'anthropic-context-windows',
  'https://platform.claude.com/docs/en/build-with-claude/context-windows',
);
const PRICING = source('anthropic-pricing', 'https://platform.claude.com/docs/en/about-claude/pricing');
const PROMPT_CACHING = source(
  'anthropic-prompt-caching',
  'https://platform.claude.com/docs/en/build-with-claude/prompt-caching',
);
const KALAI = source('kalai-why-models-hallucinate', 'https://arxiv.org/abs/2509.04664');
const KUHN = source('kuhn-clam', 'https://arxiv.org/abs/2212.07769');
const KANDPAL = source('kandpal-long-tail-knowledge', 'https://arxiv.org/abs/2211.08411');
const TOUVRON = source('touvron-llama', 'https://arxiv.org/abs/2302.13971');
const TRAINING_DATA = source(
  'anthropic-training-data',
  'https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training',
);
const MEMORY_TOOL = source(
  'anthropic-memory-tool',
  'https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool',
);

/** The Speaker note each row's AI cell opens, by trait. */
const ROW_NOTE = {
  probabilistic: 'probable-not-random',
  relentless: 'right-or-not-the-output-looks-finished',
  informed: 'why-it-is-blind-to-your-company',
  confident: 'why-it-guesses-instead-of-asking',
  'every-word-billed': 'the-bill-covers-the-whole-chat',
} as const;

/**
 * "Five traits, or you pay the PRICE" (Spec Option 2a), the cornerstone: a brilliant freelancer with amnesia, every
 * time. Overrules `three-column` for a Scene, since its columns cannot line rows up; keeps `motion: local` as the
 * trait flip. Each row is the freelancer, the trait chip and the AI; the closing line wipes every row to day one.
 */
export const payThePrice = slide({
  slug: 'pay-the-price',
  messages: { en, de },
  notes: [
    { slug: 'right-or-not-the-output-looks-finished', target: 'relentless', sources: [LIGHTMAN] },
    { slug: 'probable-not-random', target: 'probabilistic', sources: [HOLTZMAN, MESSAGES_API] },
    { slug: 'how-much-varies', target: 'probabilistic', sources: [HE, ATIL] },
    { slug: 'the-bill-covers-the-whole-chat', target: 'every-word-billed', sources: [CONTEXT_WINDOWS, PRICING] },
    { slug: 'a-discount-not-an-exemption', target: 'every-word-billed', sources: [PROMPT_CACHING] },
    { slug: 'why-it-guesses-instead-of-asking', target: 'confident', sources: [KALAI, KUHN] },
    { slug: 'why-it-is-blind-to-your-company', target: 'informed', sources: [KANDPAL, TOUVRON, TRAINING_DATA] },
    { slug: 'the-forgetting-is-in-the-design', target: 'closing', sources: [CONTEXT_WINDOWS, MEMORY_TOOL] },
  ],
  segments: [
    { slug: 'who-gets-the-job' },
    { slug: 'probabilistic-relentless' },
    { slug: 'informed' },
    { slug: 'confident-every-word-billed' },
    { slug: 'amnesia' },
    { slug: 'ai-lands-last' },
    { slug: 'the-pun' },
  ],
  content: ({ t, marker, Marker }) => (
    <SlideFrame className="mt-8">
      <PriceMirror
        columns={{ freelancer: t('columns.freelancer'), traits: t('columns.traits'), ai: t('columns.ai') }}
        rows={TRAITS.map((slug) => ({
          slug,
          name: t(`traits.${slug}.name`),
          back: t(`traits.${slug}.back`),
          aside: t(`traits.${slug}.popover`),
          freelancer: t(`traits.${slug}.freelancer`),
          ai: t.rich(`traits.${slug}.ai`, { marker: marker(ROW_NOTE[slug]) }),
        }))}
        closing={t('closing')}
        closingMarker={<Marker note="the-forgetting-is-in-the-design" className="relative inline-grid align-middle" />}
        labels={{
          prompt: t('backs.prompt'),
          handbook: t('backs.handbook'),
          bill: t('backs.bill'),
          tokens: t('backs.tokens'),
        }}
      />
    </SlideFrame>
  ),
});
