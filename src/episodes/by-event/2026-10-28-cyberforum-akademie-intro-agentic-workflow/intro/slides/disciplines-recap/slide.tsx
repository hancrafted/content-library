import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { AiDisciplines } from '@/explorable-explanations/ai-disciplines/ai-disciplines';
import de from './i18n/de.json';
import en from './i18n/en.json';

const AGENTS = {
  slug: 'anthropic-effective-agents',
  url: 'https://www.anthropic.com/engineering/building-effective-agents',
};

/**
 * The recap after the last check-in: the disciplines timeline again (Preset `recap`), workflows lit, so the evening
 * closes where the live demo worked. Its note restates the one distinction the demo rests on: a workflow's path is
 * fixed in advance, an agent picks its own (LLM-0018 finding 7).
 */
export const disciplinesRecap = slide({
  slug: 'disciplines-recap',
  messages: { en, de },
  notes: [{ slug: 'path-fixed', target: 'workflows', sources: [AGENTS] }],
  content: ({ locale, target, Marker }) => (
    <SlideFrame className="mt-6 gap-6">
      <AiDisciplines
        preset="recap"
        locale={locale}
        targets={{ workflows: target('workflows') }}
        markers={{ workflows: <Marker note="path-fixed" placement="beside" /> }}
      />
    </SlideFrame>
  ),
});
