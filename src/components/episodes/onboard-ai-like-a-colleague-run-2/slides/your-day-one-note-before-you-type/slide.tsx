import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { DayOneNote } from '@/components/slide-shared/day-one-note';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { VerticalStepper } from './vertical-stepper.client';
import type { StepperStep } from './vertical-stepper.pure';
import styles from './your-day-one-note-before-you-type.module.css';

/*
 * Before you type a word: the vertical-stepper master, copied with changes. Four steps, the lines of the day-one
 * note, sit on the shared paper; each opens to one line of depth. Below it, "Then type." with a static caret.
 */
export const yourDayOneNoteBeforeYouType = slide({
  slug: 'your-day-one-note-before-you-type',
  messages: { en, de },
  notes: [
    {
      slug: 'write-it-down',
      target: 'day-one',
      sources: [{ slug: 'claude-code-memory', url: 'https://code.claude.com/docs/en/memory' }],
    },
    {
      slug: 'short-beats-long',
      target: 'step-context',
      sources: [{ slug: 'context-rot', url: 'https://research.trychroma.com/context-rot' }],
    },
  ],
  segments: [{ slug: 'the-habit' }, { slug: 'four-lines' }],
  content: ({ t, target, Title }) => {
    const item = (step: StepperStep) => ({
      title: t(`items.${step}.title`),
      question: t(`items.${step}.question`),
      caption: t(`items.${step}.caption`),
    });
    return (
      <SlideFrame>
        <Title>{t('title')}</Title>
        <SlideCaption>{t('caption')}</SlideCaption>
        <div className="mt-10 max-w-2xl">
          <DayOneNote {...target('day-one')} label={t('dayOneLabel')} rows={[]}>
            <VerticalStepper
              label={t('dayOneLabel')}
              states={{ done: t('states.done'), current: t('states.current'), upcoming: t('states.upcoming') }}
              targets={{ context: target('step-context') }}
              items={{ context: item('context'), tools: item('tools'), brief: item('brief'), check: item('check') }}
            />
          </DayOneNote>
          <p className={`mt-6 text-body font-medium ${styles.then}`}>
            {t('then')}
            <span aria-hidden className="ml-1 inline-block h-[1.1em] w-0.5 bg-foreground align-middle" />
          </p>
        </div>
      </SlideFrame>
    );
  },
});
