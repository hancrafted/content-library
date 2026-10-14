import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { BoardColumn } from './board-column';
import { ConversionDrawing, CycleDrawing, FunnelDrawing } from './drawings';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { PipelineSheet } from './pipeline-sheet';

// A Scene on `@container`: every layout switch reads the Foreground width, never the viewport.
export const whatIsASalesPipeline = slide({
  slug: 'what-is-a-sales-pipeline',
  messages: { en, de },
  notes: [
    {
      slug: 'know-your-cycle',
      target: 'sales-cycle',
      sources: [{ slug: 'blank', url: 'https://innovation.ucsd.edu/startup/startup-toolkit/Steve-Blank-CustDev.pdf' }],
    },
  ],
  segments: [{ slug: 'funnel' }, { slug: 'conversion-rate' }, { slug: 'sales-cycle' }, { slug: 'measure-both' }],
  content: ({ t, target, Title }) => (
    <SlideFrame className="@container">
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <ul className="mt-10 grid grid-cols-1 gap-4 @3xl:grid-cols-3">
        <BoardColumn
          step={0}
          label={t('columns.funnel.label')}
          caption={t('columns.funnel.caption')}
          tells={t.rich('columns.funnel.tells')}
        >
          <FunnelDrawing
            rows={[
              t('columns.funnel.rows.leads'),
              t('columns.funnel.rows.opportunities'),
              t('columns.funnel.rows.deals'),
            ]}
          />
        </BoardColumn>
        <BoardColumn
          step={1}
          label={t('columns.conversion.label')}
          caption={t('columns.conversion.caption')}
          tells={t.rich('columns.conversion.tells')}
        >
          <ConversionDrawing from={t('columns.conversion.from')} to={t('columns.conversion.to')} />
        </BoardColumn>
        <BoardColumn
          {...target('sales-cycle')}
          step={2}
          label={t('columns.cycle.label')}
          caption={t('columns.cycle.caption')}
          tells={t.rich('columns.cycle.tells')}
        >
          <CycleDrawing start={t('columns.cycle.start')} end={t('columns.cycle.end')} />
        </BoardColumn>
      </ul>
      <PipelineSheet
        title={t('sheet.title')}
        columns={[t('sheet.columns.stage'), t('sheet.columns.firstContact'), t('sheet.columns.closed')]}
        rows={[
          [t('sheet.rows.r1.stage'), t('sheet.rows.r1.firstContact'), t('sheet.rows.r1.closed')],
          [t('sheet.rows.r2.stage'), t('sheet.rows.r2.firstContact'), t('sheet.rows.r2.closed')],
        ]}
      />
    </SlideFrame>
  ),
});
