import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The raised hand, drawn once: the first step of a question, and the Questions card's icon. */
function HandIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M8 13V5a1.5 1.5 0 0 1 3 0v6M11 10V3.5a1.5 1.5 0 0 1 3 0V10M14 10V4.5a1.5 1.5 0 0 1 3 0V12M17 9a1.5 1.5 0 0 1 3 0v5c0 4-3 7-7 7h-1c-3 0-5-2-6-4l-2-4a1.5 1.5 0 0 1 2.5-1.5L8 14"
        className="fill-none stroke-current"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// How the session runs, in two rules: the recording against the questions, the second with its order (hand, pause, ask). The Slide header shows the title and caption; the Scene holds the two cards. The note "pause first" is for the presenter and has no marker on the Slide.
export const orga = slide({
  slug: 'orga',
  messages: { en, de },
  notes: [
    { slug: 'talking-points', target: 'items' },
    { slug: 'pause-first', target: 'questions' },
  ],
  content: ({ t, target }) => (
    <SlideFrame className="justify-center">
      <div {...target('items')} data-workshop-items="" className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="card-hover card-hover--raise flex flex-col gap-6 rounded-xl border border-border bg-card p-8 shadow-md">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-youtube/15 text-youtube">
              <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
                <circle cx="12" cy="12" r="8" className="fill-current" />
              </svg>
            </span>
            <p className="text-caption font-semibold tracking-widest text-youtube uppercase">{t('recordingLabel')}</p>
          </div>
          <p className="text-subheading font-semibold text-balance">{t('recording')}</p>
          <div className="mt-auto flex items-center gap-3 rounded-xl bg-muted p-4" aria-hidden="true">
            <span className="flex size-10 items-center justify-center rounded-lg bg-youtube text-primary-foreground">
              <svg viewBox="0 0 24 24" className="size-5">
                <path d="M8 5v14l11-7z" className="fill-current" />
              </svg>
            </span>
            <div className="flex flex-1 flex-col gap-1">
              <span className="h-2 w-3/4 rounded-full bg-border" />
              <span className="h-2 w-1/2 rounded-full bg-border" />
            </div>
          </div>
        </section>
        <section
          {...target('questions')}
          className="card-hover card-hover--raise flex flex-col gap-6 rounded-xl border border-border bg-card p-8 shadow-md"
        >
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-human/15 text-human">
              <HandIcon className="size-7" />
            </span>
            <p className="text-caption font-semibold tracking-widest text-human uppercase">{t('questionsLabel')}</p>
          </div>
          <p className="text-subheading font-semibold text-balance">{t('questions')}</p>
          <ol className="mt-auto flex flex-col gap-3 sm:flex-row">
            <li className="flex flex-1 flex-col items-center gap-2 rounded-xl bg-human/10 p-4 text-center text-human">
              <span className="flex h-8 items-center justify-center">
                <HandIcon className="size-7" />
              </span>
              <p className="text-body font-semibold">{t('steps.hand')}</p>
            </li>
            <li className="flex flex-1 flex-col items-center gap-2 rounded-xl bg-youtube/10 p-4 text-center text-youtube">
              <span className="flex h-8 items-center justify-center">
                <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
                  <path
                    d="M8 3v18M16 3v18"
                    className="fill-none stroke-current"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <p className="text-body font-semibold">{t('steps.pause')}</p>
            </li>
            <li className="flex flex-1 flex-col items-center gap-2 rounded-xl bg-(--info)/10 p-4 text-center text-(--info)">
              <span className="flex h-8 items-center justify-center">
                <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
                  <rect
                    x="9"
                    y="3"
                    width="6"
                    height="11"
                    rx="3"
                    className="fill-none stroke-current"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M5 11a7 7 0 0 0 14 0M12 18v3"
                    className="fill-none stroke-current"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <p className="text-body font-semibold">{t('steps.ask')}</p>
            </li>
          </ol>
        </section>
      </div>
    </SlideFrame>
  ),
});
