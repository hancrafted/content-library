import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import {
  CallTranscript,
  type CallLight,
  type CallWho,
} from '@/episodes/components/slide-shared/call-transcript/call-transcript';
import { Context } from '@/explorables/context-window/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

const MURDOCK = { slug: 'murdock-serial-position', url: 'https://doi.org/10.1037/h0045106' };
const LIU = { slug: 'liu-lost-in-the-middle', url: 'https://arxiv.org/abs/2307.03172' };

/** The call of Slide 1 in ten lines: the start and the end lit, the middle faded, Pepper's cake the standout. */
const CALL = [
  { slug: 'holidays', who: 'you', light: 'lit' },
  { slug: 'mums-phone', who: 'sister', light: 'lit' },
  { slug: 'what-happened', who: 'you', light: 'faded' },
  { slug: 'thumb-photos', who: 'sister', light: 'faded' },
  { slug: 'renovation', who: 'you', light: 'faded' },
  { slug: 'back-hurts', who: 'sister', light: 'faded' },
  { slug: 'pepper', who: 'sister', light: 'standout' },
  { slug: 'recipe', who: 'you', light: 'faded' },
  { slug: 'dinner', who: 'sister', light: 'lit' },
  { slug: 'bye', who: 'you', light: 'lit' },
] as const satisfies readonly { slug: string; who: CallWho; light: CallLight }[];

/** The two learnings under the AI side, as keys of `chat.learnings`. */
const LEARNINGS = ['middle', 'compaction'] as const;

/** The equals glyph between the two pictures: the same shape. */
function Equals() {
  return (
    <svg viewBox="0 0 80 40" className="w-20" aria-hidden="true">
      <path d="M8 14 H 72 M8 26 H 72" className="fill-none stroke-primary" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * "What we learned so far" (Spec Option 6a, reworked by Han's batch-2 item 6): human attention on the left, the call
 * transcript of Slide 1 faded in the middle with the primacy and recency line; AI attention (context window) on the
 * right, the cornerstone's /context grid in Technical with its own local </> to switch to Simple, and the two
 * learnings; an equals sign between, and the closing line as a full-width band. Keeps `basic-page`, `motion: none`.
 */
export const whatWeLearnedSoFar = slide({
  slug: 'what-we-learned-so-far',
  messages: { en, de },
  notes: [{ slug: 'two-kinds-of-evidence', target: 'same', sources: [MURDOCK, LIU] }],
  segments: [{ slug: 'same-effects' }, { slug: 'the-window-is-the-span' }, { slug: 'manage-it' }],
  content: ({ t, locale, marker, target }) => (
    <SlideFrame className="mt-8 gap-10">
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-4 rounded-xl bg-muted p-6 lg:col-span-5">
          <p data-kicker="" className="text-body font-semibold">
            {t('call.kicker')}
          </p>
          <div className="rounded-xl border border-border bg-card p-4 shadow-md">
            <CallTranscript
              size="sm"
              label={t('call.label')}
              lines={CALL.map(({ slug, who, light }) => ({ who, light, text: t(`call.lines.${slug}`) }))}
            />
          </div>
          <p className="text-body font-semibold">{t('call.line')}</p>
        </div>
        <div {...target('same')} className="flex flex-col items-center justify-center gap-2 text-center lg:col-span-2">
          <Equals />
          <span className="text-body font-semibold">{t('same')}</span>
          <span className="text-caption text-muted-foreground">
            {t.rich('analogy', { marker: marker('two-kinds-of-evidence') })}
          </span>
        </div>
        <div className="flex min-w-0 flex-col gap-4 rounded-xl bg-muted p-6 lg:col-span-5">
          <p data-kicker="" className="text-body font-semibold">
            {t('chat.kicker')}
          </p>
          <div className="rounded-xl border border-border bg-card p-4 shadow-md">
            <Context preset="slide-6" locale={locale} />
          </div>
          <ul data-learning="" className="flex list-disc flex-col gap-2 pl-5 text-body font-semibold">
            {LEARNINGS.map((at) => (
              <li key={at}>{t(`chat.learnings.${at}`)}</li>
            ))}
          </ul>
        </div>
      </div>
      <p
        data-closing=""
        className="rounded-xl bg-primary px-8 py-5 text-center text-subheading font-semibold text-primary-foreground shadow-md"
      >
        {t('closing')}
      </p>
    </SlideFrame>
  ),
});
