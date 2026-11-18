import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { NewHireStack } from './new-hire-stack';

const NONAKA = {
  slug: 'nonaka-knowledge-creating-company',
  url: 'https://hbr.org/2007/07/the-knowledge-creating-company',
};
const SZULANSKI = { slug: 'szulanski-internal-stickiness', url: 'https://doi.org/10.1002/smj.4250171105' };
const GOURLAY = { slug: 'gourlay-critique-of-nonaka', url: 'https://doi.org/10.1111/j.1467-6486.2006.00637.x' };

const HIDDEN = 'hidden';
const HANDOVER = 'handover';

const OBVIOUS = ['budget', 'stay', 'signoff'] as const;
const RIDERS = ['dietary', 'accessibility'] as const;
const UNWRITTEN = ['lastTime', 'unwrittenRules', 'suppliers'] as const;

export const youAreTheNewHire = slide({
  slug: 'you-are-the-new-hire',
  messages: { en, de },
  notes: [
    { slug: 'why-the-middle-zone-stays-unwritten', target: HIDDEN, sources: [NONAKA] },
    { slug: 'the-newcomer-has-the-least-to-absorb-with', target: HANDOVER, sources: [SZULANSKI] },
    { slug: 'even-the-experts-cannot-always-say-it', target: HIDDEN, sources: [NONAKA] },
    { slug: 'one-caution-on-the-theory', target: HIDDEN, sources: [GOURLAY] },
  ],
  segments: [{ slug: 'obvious-questions' }, { slug: 'the-ones-you-forget' }, { slug: 'switch-of-roles' }],
  content: ({ t, marker, target }) => (
    <SlideFrame className="mt-8">
      <NewHireStack
        task={t('task')}
        obvious={{
          label: t('obvious.label'),
          questions: OBVIOUS.map((slug) => ({ slug, text: t(`obvious.questions.${slug}`) })),
        }}
        riders={RIDERS.map((slug) => ({ slug, text: t(`riders.${slug}`) }))}
        hidden={{
          label: t('hidden.label'),
          questions: UNWRITTEN.map((slug) => ({ slug, text: t(`hidden.questions.${slug}`) })),
        }}
        hiddenNote={t.rich('hidden.note', { marker: marker('why-the-middle-zone-stays-unwritten') })}
        rail={{ ask: t('rail.ask'), asked: t('rail.asked') }}
        switchLabel={t('switch')}
        handover={{
          title: t('handover.title'),
          body: t.rich('handover.body', {
            marker: marker(
              'the-newcomer-has-the-least-to-absorb-with',
              'text-primary-foreground/80 hover:bg-primary-foreground/15 hover:text-primary-foreground',
            ),
          }),
          due: t('handover.due'),
          dueDay: t('handover.dueDay'),
          echoes: [...OBVIOUS, ...UNWRITTEN].map((slug) => ({
            slug,
            text: t(`handover.echoes.${slug}`),
            unwritten: (UNWRITTEN as readonly string[]).includes(slug),
          })),
        }}
        targets={{ hidden: target(HIDDEN)['data-target'], handover: target(HANDOVER)['data-target'] }}
      />
    </SlideFrame>
  ),
});
