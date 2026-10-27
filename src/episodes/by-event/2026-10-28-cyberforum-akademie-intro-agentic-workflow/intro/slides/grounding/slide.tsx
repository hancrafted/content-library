import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { GroundingStack } from './grounding-stack';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The grounding of the evening (the Workshop template's hook, renamed because it grounds): three layers as a stack,
 * generative AI at the bottom as the engine, prompting in the middle as how to talk to it, agentic on top as the way
 * of working, with the person as captain. Layers, not a correction of the announcement: every announced term is in the
 * room. One Speaker note per layer, quoting the bridge (.scratch/academy-webinar-de/event-bridge.md).
 */
export const grounding = slide({
  slug: 'grounding',
  messages: { en, de },
  notes: [
    { slug: 'engine', target: 'engine' },
    { slug: 'agentic', target: 'agentic' },
    { slug: 'prompting', target: 'prompting' },
  ],
  content: ({ t, target }) => (
    <SlideFrame className="justify-center">
      <GroundingStack
        layers={[
          {
            slug: 'agentic',
            n: 3,
            tone: 'primary',
            label: t('layers.agentic.label'),
            name: t('layers.agentic.name'),
            line: t('layers.agentic.line'),
            target: target('agentic'),
            captain: (
              <span className="flex w-fit items-center gap-2 rounded-full bg-human px-4 py-1 text-caption font-semibold text-secondary-foreground">
                <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
                  <circle cx="8" cy="5" r="3" className="fill-current" />
                  <path d="M2 14c0-3.3 2.7-5 6-5s6 1.7 6 5z" className="fill-current" />
                </svg>
                {t('you')}
              </span>
            ),
          },
          {
            slug: 'prompting',
            n: 2,
            tone: 'info',
            label: t('layers.prompting.label'),
            name: t('layers.prompting.name'),
            line: t('layers.prompting.line'),
            target: target('prompting'),
          },
          {
            slug: 'engine',
            n: 1,
            tone: 'ai',
            label: t('layers.engine.label'),
            name: t('layers.engine.name'),
            line: t('layers.engine.line'),
            target: target('engine'),
          },
        ]}
      />
    </SlideFrame>
  ),
});
