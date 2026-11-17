import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { GoalNote } from '@/episodes/components/slide-shared/party-notes/goal-note';
import { ForceWedges } from './force-wedges';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { LevelCard, LevelGrid, type Level } from './level-card';
import { OriginStrip } from './origin-strip';
import { ExampleTask, TaskExample } from './task-example';

const LOSING_HUMANITY = {
  slug: 'hrw-losing-humanity',
  url: 'https://www.hrw.org/report/2012/11/19/losing-humanity/case-against-killer-robots',
};
const EU_ETHICS = {
  slug: 'eu-hleg-ethics-guidelines',
  url: 'https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419',
};
const ANTHROPIC = {
  slug: 'anthropic-measuring-agent-autonomy',
  url: 'https://www.anthropic.com/research/measuring-agent-autonomy',
};
const WILLISON = { slug: 'willison-software-factory', url: 'https://simonwillison.net/2026/Feb/7/software-factory/' };
const AI_ACT = { slug: 'eu-ai-act-article-14', url: 'https://artificialintelligenceact.eu/article/14/' };
const SHERIDAN = {
  slug: 'sheridan-human-supervisory-control',
  url: 'https://www.hlaszny.com/booksAndPapers/buckets/b3_handbookOfSysEng/Ch%2016%20Human%20Supervisory%20Control.pdf',
};
const FAA = {
  slug: 'faa-ac-120-123',
  url: 'https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_120-123.pdf',
};

const ORIGIN = 'origin-of-the-three-terms';
const TWO_SENSES = 'two-senses-of-on';
const NOT_A_LADDER = 'levels-are-not-a-strict-ladder';
const AVIATION = 'aviation-supplied-the-concept-not-the-words';

const LEVELS: readonly Level[] = ['in', 'on', 'out'];
const ICONS = { in: 'gate', on: 'eye', out: 'log' } as const;

export const inOnOrOutOfTheLoop = slide({
  slug: 'in-on-or-out-of-the-loop',
  messages: { en, de },
  captionNote: 'out-is-a-per-step-property',
  notes: [
    { slug: ORIGIN, target: 'origin', sources: [LOSING_HUMANITY] },
    { slug: TWO_SENSES, target: 'on-level', sources: [EU_ETHICS] },
    { slug: 'approving-to-monitoring', target: 'on-level', sources: [ANTHROPIC] },
    { slug: 'out-is-a-per-step-property', target: 'caption', sources: [WILLISON] },
    { slug: 'regulation-limits-out', target: 'out-level', sources: [AI_ACT] },
    { slug: AVIATION, target: 'origin', sources: [SHERIDAN] },
    { slug: NOT_A_LADDER, target: 'forces', sources: [FAA] },
  ],
  segments: [{ slug: 'in' }, { slug: 'on' }, { slug: 'out' }, { slug: 'borrowed-terms' }, { slug: 'per-task' }],
  content: ({ t, target, Marker }) => (
    <SlideFrame className="@container">
      <div className="relative flex flex-col gap-6 rounded-xl bg-muted p-4 pt-8 @3xl:p-8">
        <span className="absolute -top-4 right-6 rotate-2 rounded-md bg-primary px-4 py-1 text-body font-semibold text-primary-foreground shadow-md @3xl:right-10">
          {t('stamp')}
        </span>
        <LevelGrid label={t('levelsLabel')}>
          {LEVELS.map((level) => (
            <LevelCard
              key={level}
              level={level}
              label={t(`levels.${level}.label`)}
              name={t(`levels.${level}.name`)}
              abbr={t(`levels.${level}.abbr`)}
              definition={t(`levels.${level}.definition`)}
              role={{ name: t(`levels.${level}.role`), does: t(`levels.${level}.does`), icon: ICONS[level] }}
              marker={level === 'on' && <Marker note={TWO_SENSES} placement="beside" />}
              targetProps={level === 'in' ? undefined : target(level === 'on' ? 'on-level' : 'out-level')}
            />
          ))}
        </LevelGrid>
        <div className="flex flex-wrap items-center gap-3">
          <ExampleTask card={t('example.card')} task={t('example.task')} label={t('example.label')} />
          <svg
            viewBox="0 0 120 24"
            preserveAspectRatio="none"
            className="hidden h-6 min-w-8 flex-1 @3xl:block"
            aria-hidden="true"
          >
            <path
              d="M2 12H116M106 4L118 12L106 20"
              className="fill-none stroke-foreground"
              strokeWidth={2.5}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <GoalNote label={t('goal.label')} text={t('goal.text')} className="w-full shrink-0 @3xl:w-1/4" />
        </div>
        <ol className="grid grid-cols-1 gap-6 @3xl:grid-cols-3" aria-label={t('example.listLabel')}>
          {LEVELS.map((level) => (
            <TaskExample
              key={level}
              level={level}
              label={t(`levels.${level}.label`)}
              text={t(`example.${level}.text`)}
              aside={t(`example.${level}.aside`)}
              agent={t('agent')}
            />
          ))}
        </ol>
        <div {...target('forces')}>
          <ForceWedges
            risk={{ label: t('risk.label'), hint: t('risk.hint') }}
            speed={{ label: t('speed.label'), hint: t('speed.hint') }}
            marker={<Marker note={NOT_A_LADDER} placement="beside" />}
          />
        </div>
        <OriginStrip
          label={t('origin.label')}
          targetProps={target('origin')}
          origins={[
            { text: t('origin.words'), marker: <Marker note={ORIGIN} placement="beside" /> },
            { text: t('origin.concept'), marker: <Marker note={AVIATION} placement="beside" /> },
          ]}
        />
      </div>
    </SlideFrame>
  ),
});
