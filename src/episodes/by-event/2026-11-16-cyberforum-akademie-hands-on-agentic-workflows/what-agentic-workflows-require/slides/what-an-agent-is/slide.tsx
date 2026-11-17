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

const AGENTS = 'agents';

const PROMINENT =
  '-translate-y-4 size-9 border-2 border-primary bg-background text-primary shadow-md ring-2 ring-brand-accent hover:bg-background hover:text-primary [&_svg]:size-5';

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
