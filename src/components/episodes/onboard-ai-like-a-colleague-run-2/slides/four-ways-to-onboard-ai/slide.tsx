import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { DisciplineRings } from './discipline-rings';
import de from './i18n/de.json';
import en from './i18n/en.json';

const RINGS = ['prompt', 'context', 'harness', 'graph'] as const;

/*
 * Four disciplines: a Scene in place of the Dossier's basic-page (FE-002 §3), because the idea is one diagram, four
 * rings nested around the task, beside a key naming each ring with its one line; basic-page's `<p>` body pinned to
 * the bottom cannot hold it. The header parts stay basic-page's. The rings draw from the centre out, once (CSS only).
 */
export const fourWaysToOnboardAi = slide({
  slug: 'four-ways-to-onboard-ai',
  messages: { en, de },
  notes: [
    {
      slug: 'context-is-finite',
      target: 'context',
      sources: [
        {
          slug: 'effective-context-engineering',
          url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
        },
      ],
    },
    {
      slug: 'handover-as-harness',
      target: 'harness',
      sources: [
        {
          slug: 'effective-harnesses',
          url: 'https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents',
        },
      ],
    },
  ],
  segments: [{ slug: 'prompt-and-context' }, { slug: 'harness' }, { slug: 'graph-newest' }],
  content: ({ t, target, Title }) => {
    const targets = { context: target('context'), harness: target('harness') } as const;
    return (
      <SlideFrame>
        <Title>{t('title')}</Title>
        <SlideCaption>{t('caption')}</SlideCaption>
        <DisciplineRings
          task={t('task')}
          figureLabel={t('figure')}
          rings={RINGS.map((id) => ({
            id,
            short: t(`rings.${id}.short`),
            name: t(`rings.${id}.name`),
            line: t(`rings.${id}.line`),
            tag: id === 'graph' ? t('rings.graph.tag') : undefined,
            target: id === 'context' || id === 'harness' ? targets[id] : undefined,
          }))}
        />
      </SlideFrame>
    );
  },
});
