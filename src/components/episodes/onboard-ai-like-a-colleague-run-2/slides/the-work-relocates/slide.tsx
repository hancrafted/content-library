import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { useId, type ReactNode } from 'react';
import { EffortBar } from './effort-bar';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The figure named by a visually hidden sentence, its schematic note as the caption.
function Figure({ label, caption, children }: { label: ReactNode; caption: ReactNode; children: ReactNode }) {
  const id = `the-work-relocates-${useId()}`;
  return (
    <figure aria-labelledby={id} className="flex flex-col gap-6">
      <p id={id} className="sr-only">
        {label}
      </p>
      {children}
      <figcaption className="text-caption text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}

/*
 * One task's effort, drawn twice at the same width: the basic-page master copied with changes. Its title, caption
 * and body position are the master's, but a <figure> stands where the prose would go, because the master's prose
 * slot is a <p> and cannot hold the bars (FE-002 §3). Bar 1 is typing it yourself; in bar 2 the same width splits
 * into your judgement (briefing, context, tools, checking) and a small AI segment. A dashed rule beside both bars
 * says the total does not shrink. The motion is progress, so it is scroll-driven (the-work-relocates.module.css).
 */
export const theWorkRelocates = slide({
  slug: 'the-work-relocates',
  messages: { en, de },
  notes: [
    {
      slug: 'individual-time',
      target: 'relocated',
      sources: [{ slug: 'early-2025-study', url: 'https://arxiv.org/abs/2507.09089' }],
    },
    {
      slug: 'employers-restructured',
      target: 'relocated',
      sources: [{ slug: 'still-waters-rapid-currents', url: 'https://www.nber.org/papers/w33777' }],
    },
    {
      slug: 'value-with-complements',
      target: 'total',
      sources: [{ slug: 'productivity-j-curve', url: 'https://www.nber.org/papers/w25148' }],
    },
  ],
  segments: [{ slug: 'relocated-not-removed' }, { slug: 'why-the-shortfall' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div className="mt-auto pt-10">
        <Figure label={t('figure')} caption={t('schematic')}>
          <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              <EffortBar segments={[{ slug: 'typing', label: t('bars.before.typing'), tone: 'typing', weight: 9 }]} />
              <div {...target('relocated')} className="flex flex-col gap-2">
                <p className="text-caption font-medium text-primary">{t('moves')}</p>
                <EffortBar
                  animated
                  segments={[
                    { slug: 'briefing', label: t('bars.after.briefing'), tone: 'human', weight: 2 },
                    { slug: 'context', label: t('bars.after.context'), tone: 'human', weight: 2 },
                    { slug: 'tools', label: t('bars.after.tools'), tone: 'human', weight: 1.5 },
                    { slug: 'checking', label: t('bars.after.checking'), tone: 'human', weight: 2.5 },
                    { slug: 'ai', label: t('bars.after.ai'), tone: 'ai', weight: 1 },
                  ]}
                />
              </div>
            </div>
            <p
              {...target('total')}
              className="border-t-2 border-dashed border-border pt-2 text-caption text-muted-foreground md:flex md:w-28 md:shrink-0 md:items-center md:border-t-0 md:border-l-2 md:pt-0 md:pl-3"
            >
              {t('total')}
            </p>
          </div>
        </Figure>
      </div>
    </SlideFrame>
  ),
});
