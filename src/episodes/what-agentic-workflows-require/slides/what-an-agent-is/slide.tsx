import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { AiCapability } from '@/explorables/ai-capability/ai-capability';
import de from './i18n/de.json';
import en from './i18n/en.json';

const ANTHROPIC = {
  slug: 'anthropic-building-effective-agents',
  url: 'https://www.anthropic.com/engineering/building-effective-agents',
};
const WILLISON = { slug: 'willison-agent-definition', url: 'https://simonwillison.net/2025/Sep/18/agents/' };

/** The Agents column, the one the two notes explain. */
const AGENTS = 'agents';

/**
 * The cited-definition marker, set off from the dark back face: a large bubble on a primary rim and an accent ring,
 * lifted over the card's top edge.
 */
const PROMINENT =
  '-translate-y-4 size-9 border-2 border-primary bg-background text-primary shadow-md ring-2 ring-brand-accent hover:bg-background hover:text-primary [&_svg]:size-5';

/**
 * What an agent is (picked Option 3a): the AI capability Explorable on its `agents` Preset, Agents lit and its card
 * resting back side up on Anthropic's definition, word for word as the Speaker note cites it, with the prominent marker
 * to that note on the card and the shorter form beside its source. The caption keeps the Episode's own sentence. The
 * scenes play the summer party; every other word is the Explorable's own.
 */
export const whatAnAgentIs = slide({
  slug: 'what-an-agent-is',
  messages: { en, de },
  captionNote: 'anthropic-definition',
  notes: [
    { slug: 'anthropic-definition', target: AGENTS, sources: [ANTHROPIC] },
    { slug: 'shorter-form', target: AGENTS, sources: [WILLISON] },
  ],
  segments: [{ slug: 'model-tools-loop' }, { slug: 'steers-its-own-steps' }],
  content: ({ t, locale, target, Marker }) => (
    <SlideFrame className="mt-6 gap-6">
      <AiCapability
        preset="agents"
        locale={locale}
        words={{
          levels: {
            agents: {
              definition: t('explorable.levels.agents.definition'),
              sourceLabel: t('explorable.levels.agents.sourceLabel'),
              sourceUrl: ANTHROPIC.url,
            },
          },
          scenes: {
            prompt: t('explorable.scenes.prompt'),
            agentPrompt: t('explorable.scenes.agentPrompt'),
            tool2: t('explorable.scenes.tool2'),
            agentAnswer: t('explorable.scenes.agentAnswer'),
          },
        }}
        targets={{ agents: target(AGENTS) }}
        markers={{ agents: <Marker note="anthropic-definition" placement="beside" className={PROMINENT} /> }}
        sourceMarkers={{
          agents: <Marker note="shorter-form" placement="beside" className="text-background" />,
        }}
      />
    </SlideFrame>
  ),
});
