import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Check } from 'lucide-react';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The quiz Workflow's three stages, as keys of `stages`, all done by the close. */
const STAGES = ['requirements', 'execute', 'improve'] as const;

/** The Brief's three Actionables, as keys of `actions`. */
const ACTIONS = ['first', 'second', 'third'] as const;

// The close lands the learning goal: the quiz Workflow ticked off on the left, the three next steps on the right, then the critical-thinking question and Q&A below. The Slide header shows the title and caption.
export const close = slide({
  slug: 'close',
  messages: { en, de },
  notes: [{ slug: 'talking-points', target: 'board' }],
  content: ({ t, target }) => (
    <SlideFrame className="justify-center gap-6">
      <div {...target('board')} className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-8 shadow-md">
          <p className="text-caption font-semibold tracking-widest text-muted-foreground uppercase">
            {t('boardLabel')}
          </p>
          <ol className="flex flex-col gap-3">
            {STAGES.map((key) => (
              <li key={key} className="flex items-start gap-3">
                <span className="flex size-8 flex-none items-center justify-center rounded-full bg-(--success) text-background">
                  <Check aria-hidden="true" className="size-5" />
                </span>
                <p className="pt-0.5 text-body font-semibold">{t(`stages.${key}`)}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="flex flex-col gap-4 rounded-xl bg-primary p-8 text-primary-foreground shadow-md">
          <p className="text-caption font-semibold tracking-widest uppercase opacity-80">{t('actionsLabel')}</p>
          <ol className="flex list-decimal flex-col gap-3 pl-5">
            {ACTIONS.map((key) => (
              <li key={key} className="text-body">
                {t(`actions.${key}`)}
              </li>
            ))}
          </ol>
        </section>
      </div>
      <div className="flex flex-col gap-2 rounded-xl border border-(--info)/40 bg-(--info)/10 p-6 md:flex-row md:items-center md:justify-between">
        <p className="text-subheading font-semibold text-balance">{t('question')}</p>
        <p className="text-caption font-semibold tracking-widest text-(--info) uppercase">{t('qa')}</p>
      </div>
    </SlideFrame>
  ),
});
