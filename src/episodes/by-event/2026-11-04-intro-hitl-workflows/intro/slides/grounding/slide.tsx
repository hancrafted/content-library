import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { AiCapability } from '@/explorables/ai-capability/ai-capability';
import de from './i18n/de.json';
import en from './i18n/en.json';

// evidence: docs/llm-wiki/research/LLM/LLM-0018__ai-layers-model-to-factory/research.md
const CHATGPT = { slug: 'openai-introducing-chatgpt', url: 'https://openai.com/index/chatgpt/' };
const PROMPTING = {
  slug: 'openai-prompt-engineering',
  url: 'https://developers.openai.com/api/docs/guides/prompt-engineering',
};
const AGENTS = {
  slug: 'anthropic-effective-agents',
  url: 'https://www.anthropic.com/engineering/building-effective-agents',
};
const CLAUDE_CODE = { slug: 'anthropic-claude-code', url: 'https://www.anthropic.com/news/claude-3-7-sonnet' };
const LANGGRAPH = { slug: 'langchain-langgraph', url: 'https://www.langchain.com/blog/langgraph' };
const FIVE_LEVELS = {
  slug: 'shapiro-five-levels',
  url: 'https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/',
};
const STRONGDM = { slug: 'strongdm-software-factory', url: 'https://factory.strongdm.ai/' };

export const grounding = slide({
  slug: 'grounding',
  messages: { en, de },
  notes: [
    { slug: 'prompting', target: 'prompting', sources: [CHATGPT, PROMPTING] },
    { slug: 'agents', target: 'agents', sources: [AGENTS, CLAUDE_CODE] },
    { slug: 'workflows', target: 'workflows', sources: [LANGGRAPH, AGENTS] },
    { slug: 'factory', target: 'factory', sources: [FIVE_LEVELS, STRONGDM] },
  ],
  content: ({ locale, target, Marker }) => (
    <SlideFrame className="mt-6 gap-6">
      <AiCapability
        preset="timeline"
        locale={locale}
        targets={{
          prompting: target('prompting'),
          agents: target('agents'),
          workflows: target('workflows'),
          factory: target('factory'),
        }}
        markers={{
          prompting: <Marker note="prompting" placement="beside" />,
          agents: <Marker note="agents" placement="beside" />,
          workflows: <Marker note="workflows" placement="beside" />,
          factory: <Marker note="factory" placement="beside" />,
        }}
      />
    </SlideFrame>
  ),
});
