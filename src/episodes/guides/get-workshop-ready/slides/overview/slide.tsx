import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ChainPiece, type ChainStep, type PieceKind, type RouteState } from './chain-piece';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { ChainLink, SideRoute, SkipArc } from './route-parts';

const W3C_MULTI_PAGE = { slug: 'w3c-multi-page-forms', url: 'https://www.w3.org/WAI/tutorials/forms/multi-page/' };
const ENDOWED_PROGRESS = { slug: 'nunes-dreze-endowed-progress', url: 'https://doi.org/10.1086/500480' };
const MINIMAL_MANUAL = { slug: 'lazonder-minimal-manual', url: 'https://doi.org/10.1006/imms.1993.1081' };
const EXPERTISE_REVERSAL = { slug: 'kalyuga-expertise-reversal', url: 'https://doi.org/10.1207/S15326985EP3801_4' };

type Step = '1' | '2' | '3' | '4' | '5' | '6' | '7';

/** The route's four pieces in order, each with the steps it holds; step 1, this Slide, is done, step 2 is next. */
const ROUTE: readonly { kind: PieceKind; state: RouteState; steps: readonly Step[] }[] = [
  { kind: 'terminal', state: 'current', steps: ['1', '2'] },
  { kind: 'agent', state: 'upcoming', steps: ['3', '4'] },
  { kind: 'folder', state: 'upcoming', steps: ['5', '6'] },
  { kind: 'skill', state: 'upcoming', steps: ['7'] },
];

const STATES: Readonly<Partial<Record<Step, RouteState>>> = { '1': 'done', '2': 'current' };
const stateOf = (step: Step): RouteState => STATES[step] ?? 'upcoming';

/** The step the skip to step 5 lands on. */
const LANDING: Step = '5';

/**
 * Overview (Spec Option 1b): the route as the Visual language's chain, four pieces with their steps inside, the skip to
 * step 5 drawn as a jump over the AI agent piece and the technical route as a dashed side road; every link visible at
 * rest, no toolbar and no motion. The skip lands on the folder Section's section slide, the first Slide of step 5's
 * Section.
 */
export const overview = slide({
  slug: 'overview',
  messages: { en, de },
  notes: [
    { slug: 'say-how-many-steps', target: 'count', sources: [W3C_MULTI_PAGE] },
    { slug: 'a-head-start-finishes-more', target: 'head-start', sources: [ENDOWED_PROGRESS] },
    { slug: 'minimal-still-needs-a-way-out', target: 'stuck', sources: [MINIMAL_MANUAL, EXPERTISE_REVERSAL] },
  ],
  segments: [{ slug: 'four-pieces-one-chain' }, { slug: 'skip-what-you-have' }],
  content: ({ t, locale, slideHref, target, marker, Marker }) => {
    const step = (n: Step): ChainStep => ({
      n: Number(n),
      // Step 1, this Slide, is the head start: its title ends on the note's Context marker.
      title:
        n === '1' ? (
          <span {...target('head-start')}>{t.rich('steps.1', { marker: marker('a-head-start-finishes-more') })}</span>
        ) : (
          t(`steps.${n}`)
        ),
      state: stateOf(n),
      ...(n === LANDING && { landing: true }),
    });
    return (
      <SlideFrame className="@container gap-8">
        <div className="flex flex-col gap-3 @3xl:flex-row @3xl:items-center @3xl:justify-between">
          <span
            {...target('count')}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card py-1.5 pr-1.5 pl-4 text-caption"
          >
            <b className="font-semibold">{t('count')}</b>
            <span className="text-muted-foreground">· {t('time')}</span>
            <Marker note="say-how-many-steps" placement="beside" />
          </span>
          <span className="text-caption text-muted-foreground">{t('chainLine')}</span>
        </div>
        <div className="flex flex-col">
          <SkipArc label={t('skip.agent')} link={slideHref('download-and-unzip-the-starter-folder')} locale={locale} />
          <ol
            className="focus-group focus-group--dim-others flex flex-col gap-3 @3xl:flex-row @3xl:items-stretch @3xl:gap-0"
            aria-label={t('chainLabel')}
          >
            {ROUTE.map((piece, index) => [
              index > 0 && <ChainLink key={`link-${piece.kind}`} />,
              <ChainPiece
                key={piece.kind}
                kind={piece.kind}
                label={t(`pieces.${piece.kind}.label`)}
                section={t(`pieces.${piece.kind}.section`)}
                state={piece.state}
                steps={piece.steps.map(step)}
                {...(piece.kind === 'skill' && { result: t('result') })}
              />,
            ])}
          </ol>
        </div>
        <div className="grid gap-6 @3xl:grid-cols-12 @3xl:items-center">
          <SideRoute
            n={8}
            section={t('skip.technical.section')}
            title={t('skip.technical.title')}
            lead={t('skip.technical.lead')}
            action={t('skip.technical.action')}
            link={slideHref('the-technical-route')}
            locale={locale}
          />
          <div {...target('stuck')} className="flex items-center gap-3 rounded-2xl bg-muted px-5 py-4 @3xl:col-span-4">
            <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="9" className="fill-none stroke-muted-foreground" strokeWidth="1.5" />
              <path
                d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01"
                className="fill-none stroke-muted-foreground"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-caption text-muted-foreground">
              {t.rich('stuck', {
                b: (chunks) => <b className="font-semibold text-foreground">{chunks}</b>,
                marker: marker('minimal-still-needs-a-way-out'),
              })}
            </p>
          </div>
        </div>
      </SlideFrame>
    );
  },
});
