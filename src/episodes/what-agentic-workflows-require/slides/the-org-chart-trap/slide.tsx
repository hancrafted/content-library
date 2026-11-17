import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ConwayQuote } from './conway-quote';
import { DraftWorkflow } from './draft-workflow';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { OrgChart } from './org-chart';

const CONWAY_LAW = { slug: 'conway-law', url: 'https://www.melconway.com/Home/Conways_Law.html' };
const CONWAY_COMMITTEES = { slug: 'conway-committees', url: 'https://www.melconway.com/Home/Committees_Paper.html' };
const COLFER_BALDWIN = {
  slug: 'colfer-baldwin-mirroring',
  url: 'https://dash.harvard.edu/server/api/core/bitstreams/7312037e-28a6-6bd4-e053-0100007fdf3b/content',
};

const ROLES = [
  { slug: 'venue', people: 10, focus: true },
  { slug: 'catering', people: 1 },
  { slug: 'travel', people: 1 },
] as const;

const VENUE_STEPS = [
  'brief',
  'regions',
  'long-list',
  'call',
  'dates',
  'north',
  'south',
  'score',
  'prices',
  'revisit',
  'shortlist',
  'present',
  'vote',
  'book',
] as const;

function Copies({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center text-caption text-muted-foreground">
      <span>{label}</span>
      <svg viewBox="0 0 48 24" className="h-6 w-12 rotate-90 @5xl:rotate-0" aria-hidden="true">
        <path
          d="M2 12 H40 M32 4 L42 12 L32 20"
          className="fill-none stroke-foreground"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export const theOrgChartTrap = slide({
  slug: 'the-org-chart-trap',
  messages: { en, de },
  notes: [
    { slug: 'the-law-as-conway-states-it', target: 'quote', sources: [CONWAY_LAW] },
    { slug: 'why-it-happens', target: 'org-chart', sources: [CONWAY_COMMITTEES] },
    { slug: 'a-tendency-not-a-rule', target: 'hedges', sources: [COLFER_BALDWIN] },
    { slug: 'components-include-tasks', target: 'draft', sources: [COLFER_BALDWIN] },
    { slug: 'the-first-design-is-not-the-best', target: 'hedges', sources: [CONWAY_COMMITTEES] },
  ],
  segments: [{ slug: 'conways-law' }, { slug: 'a-teams-draft' }, { slug: 'broadly-defined' }, { slug: 'your-sign' }],
  content: ({ t, marker, Marker, target }) => (
    <SlideFrame className="gap-8 @container">
      <div className="grid grid-cols-1 gap-6 rounded-xl bg-muted p-5 @3xl:p-8 @5xl:grid-cols-12">
        <div {...target('org-chart')} className="w-full max-w-lg min-w-0 @5xl:col-span-4 @5xl:max-w-none">
          <OrgChart
            label={
              <>
                {t('orgChart.label')}
                <Marker note="why-it-happens" placement="beside" />
              </>
            }
            lead={t('orgChart.lead')}
            roles={ROLES.map((role) => ({
              ...role,
              label: t(`orgChart.roles.${role.slug}.label`),
              count: t(`orgChart.roles.${role.slug}.people`),
            }))}
          />
        </div>
        <div className="@5xl:col-span-1">
          <Copies label={t('copies')} />
        </div>
        <div {...target('draft')} className="min-w-0 @5xl:col-span-7">
          <DraftWorkflow
            label={
              <>
                {t('workflow.label')}
                <Marker note="components-include-tasks" placement="beside" />
              </>
            }
            columns={[
              {
                slug: 'venue',
                focus: true,
                label: t('workflow.columns.venue.label'),
                steps: VENUE_STEPS.map((step) => t(`workflow.columns.venue.steps.${step}`)),
              },
              {
                slug: 'catering',
                label: t('workflow.columns.catering.label'),
                steps: [t('workflow.columns.catering.steps.order')],
              },
              {
                slug: 'travel',
                label: t('workflow.columns.travel.label'),
                steps: [t('workflow.columns.travel.steps.trains')],
              },
            ]}
            goalLabel={t('goalLabel')}
            goal={t('goal')}
            goalNote={t('goalNote')}
          />
        </div>
      </div>
      <ConwayQuote
        quote={t('quote')}
        author={t('author')}
        marker={marker('the-law-as-conway-states-it')('')}
        hedges={[
          { slug: 'tendency', text: t.rich('hedges.tendency', { marker: marker('a-tendency-not-a-rule') }) },
          { slug: 'inference', text: t('hedges.inference') },
          {
            slug: 'firstDesign',
            text: t.rich('hedges.firstDesign', { marker: marker('the-first-design-is-not-the-best') }),
          },
        ]}
        targets={{ quote: target('quote'), hedges: target('hedges') }}
      />
    </SlideFrame>
  ),
});
