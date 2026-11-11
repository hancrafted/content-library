import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { RotGrid } from './rot-grid';

const LLM_0007 = {
  slug: 'context-rot-as-window-fills',
  url: 'https://github.com/hancrafted/content-library/blob/main/docs/episodes/ai-attention-span/research/LLM-0007__context-rot-as-window-fills/research.md',
};
const BREUNIG = {
  slug: 'breunig-how-long-contexts-fail',
  url: 'https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html',
};
const IBM = { slug: 'ibm-context-engineering-failure-modes', url: 'https://www.youtube.com/watch?v=BwXremQ-i6I' };

const COLUMNS = ['poisoning', 'distraction', 'confusion', 'clash'] as const;
const STATIC = ['wrong-screw', 'binder', 'wrenches', 'two-sheets'] as const;
const DYNAMIC = ['mislabelled-box', 'colleagues', 'crates', 'rush-vs-check'] as const;

/** The dynamic cells whose mess the confusion-and-clash numbers measure. */
const MEASURED: readonly string[] = ['colleagues', 'crates'];

/**
 * "Context rot" (Spec Option 11a), on screen "Context rot at the bench": the four kinds of mess across, static and
 * dynamic down, eight bench vignettes with the mess in `warning` and the four terms as small captions only.
 * Overrules `grid-2x2`: the library has no 2x4, so a Scene from `SlideFrame`. Keeps `motion: none`.
 */
export const contextRot = slide({
  slug: 'context-rot',
  messages: { en, de },
  notes: [
    { slug: 'length-alone-does-part-of-the-damage', target: 'distraction', sources: [LLM_0007] },
    { slug: 'the-four-names', target: 'credit', sources: [BREUNIG] },
    { slug: 'credit-and-limit', target: 'credit', sources: [IBM] },
    { slug: 'numbers-for-confusion-and-clash', target: 'dynamic-row', sources: [BREUNIG] },
  ],
  segments: [
    { slug: 'junk-drawer-meeting-two-bosses' },
    { slug: 'static-row' },
    { slug: 'dynamic-row' },
    { slug: 'more-context-worse-result' },
  ],
  content: ({ t, target, Marker }) => (
    <SlideFrame className="@container mt-8">
      <RotGrid
        credit={
          <p
            {...target('credit')}
            className="inline-flex flex-wrap items-center gap-1 text-caption text-muted-foreground"
          >
            {t('credit')}
            <Marker note="the-four-names" placement="beside" />
            <Marker note="credit-and-limit" placement="beside" />
          </p>
        }
        columns={COLUMNS.map((column) => ({
          label: t(`columns.${column}.label`),
          term: t(`columns.${column}.term`),
          ...(column === 'distraction' && {
            target: target('distraction'),
            marker: <Marker note="length-alone-does-part-of-the-damage" placement="beside" />,
          }),
          ...(column === 'confusion' && {
            marker: <Marker note="numbers-for-confusion-and-clash" placement="beside" />,
          }),
        }))}
        rows={[
          {
            label: t('rows.static.label'),
            when: t('rows.static.when'),
            edge: 'faint',
            cells: STATIC.map((mess) => ({ mess, text: t(`rows.static.cells.${mess}`) })),
          },
          {
            label: t('rows.dynamic.label'),
            when: t('rows.dynamic.when'),
            edge: 'strong',
            target: target('dynamic-row'),
            cells: DYNAMIC.map((mess) => ({
              mess,
              text: t(`rows.dynamic.cells.${mess}`),
              ...(MEASURED.includes(mess) && {
                marker: <Marker note="numbers-for-confusion-and-clash" placement="beside" />,
              }),
            })),
          },
        ]}
      />
    </SlideFrame>
  ),
});
