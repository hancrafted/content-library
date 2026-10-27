import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The three steps, as keys of `flow.steps`: add or drop one in both Translation files. */
const STEPS = ['first', 'second', 'third'] as const;

/**
 * The Title slide's hero Scene (the record's `title`): the engine feeds a chain of steps, a prompt built into each
 * one and a person checking between them. Soft tints and hairline borders, no solid fills: the colour carries the
 * structure (ai the engine, info the steps, brand-accent the prompt, human the person), the title above stays the
 * focus. The empty Backdrop is the Title slide's one Backdrop, holding no glow.
 */
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t }) => (
    <>
      <SlideBackdrop mobile />
      <SlideFrame className="mt-6 gap-6">
        <p className="w-fit rounded-full bg-(--info)/15 px-4 py-1 text-caption font-semibold tracking-widest text-(--info) uppercase">
          {t('kicker')}
        </p>
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-12 md:gap-6">
          <div className="card-hover card-hover--raise flex flex-col justify-center gap-2 rounded-2xl border border-ai/60 bg-ai/20 p-6 md:col-span-3">
            <p className="text-caption font-semibold tracking-widest uppercase">{t('flow.engine')}</p>
            <p className="text-body font-semibold">{t('flow.engineName')}</p>
            <p className="text-caption text-muted-foreground">{t('flow.engineHint')}</p>
          </div>
          <svg
            viewBox="0 0 40 24"
            className="h-8 w-full rotate-90 self-center md:col-span-1 md:h-full md:rotate-0"
            aria-hidden="true"
          >
            <path
              d="M2 12H32M24 4L34 12L24 20"
              className="fill-none stroke-foreground"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex flex-col gap-3 md:col-span-8">
            <ol className="flex flex-col items-stretch gap-3 md:flex-row md:items-center" aria-label={t('flow.way')}>
              {STEPS.map((step, index) => (
                <li key={step} className="contents">
                  {index > 0 && (
                    <span
                      title={t('flow.you')}
                      className="flex size-12 shrink-0 items-center justify-center self-center rounded-full border border-human/50 bg-human/15 text-caption font-semibold text-human"
                    >
                      {t('flow.youLabel')}
                    </span>
                  )}
                  <div className="card-hover card-hover--raise flex flex-1 flex-col gap-2 rounded-xl border border-(--info)/40 bg-(--info)/15 p-4">
                    <b className="text-body font-semibold">
                      {index + 1} {t(`flow.steps.${step}`)}
                    </b>
                    <span className="w-fit rounded-full border border-brand-accent/50 bg-brand-accent/15 px-3 py-0.5 text-caption font-semibold">
                      {t('flow.promptChip')}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
            <p className="flex items-center gap-3 text-caption font-semibold tracking-widest text-(--info) uppercase">
              <span className="h-1 flex-1 rounded-full bg-(--info)/30" />
              {t('flow.way')}
              <span className="h-1 flex-1 rounded-full bg-(--info)/30" />
            </p>
          </div>
        </div>
      </SlideFrame>
    </>
  ),
});
