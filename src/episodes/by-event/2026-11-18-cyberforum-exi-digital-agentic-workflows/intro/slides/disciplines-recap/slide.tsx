import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { AiCapability } from '@/explorables/ai-capability/ai-capability';
import de from './i18n/de.json';
import en from './i18n/en.json';

const AGENTS = {
  slug: 'anthropic-effective-agents',
  url: 'https://www.anthropic.com/engineering/building-effective-agents',
};

// evidence: docs/llm-wiki/research/LLM/LLM-0018__ai-layers-model-to-factory/research.md
export const disciplinesRecap = slide({
  slug: 'disciplines-recap',
  messages: { en, de },
  notes: [{ slug: 'path-fixed', target: 'workflows', sources: [AGENTS] }],
  content: ({ locale, target, Marker }) => (
    <SlideFrame className="mt-6 gap-6">
      <AiCapability
        preset="recap"
        locale={locale}
        targets={{ workflows: target('workflows') }}
        markers={{ workflows: <Marker note="path-fixed" placement="beside" /> }}
      />
    </SlideFrame>
  ),
});
