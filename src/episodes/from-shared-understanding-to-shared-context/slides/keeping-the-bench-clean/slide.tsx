import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ContextBarsPreset } from '@/explorables/context-window/context';
import { FixColumn } from './fix-column';
import { FreshBench } from './fresh-bench';
import de from './i18n/de.json';
import en from './i18n/en.json';

const IBM = { slug: 'ibm-context-engineering-failure-modes', url: 'https://www.youtube.com/watch?v=BwXremQ-i6I' };
const BREUNIG_FIX = {
  slug: 'breunig-how-to-fix-your-context',
  url: 'https://www.dbreunig.com/2025/06/26/how-to-fix-your-context.html',
};
const ANTHROPIC = {
  slug: 'anthropic-effective-context-engineering',
  url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
};

/** The four fixes in Slide 11's column order, each from its mess to its clean state. */
const FIXES = [
  { key: 'validate', before: 'wrong-screw', after: 'checked-sheet' },
  { key: 'compact', before: 'binder', after: 'one-page' },
  { key: 'curate', before: 'wrenches', after: 'three-wrenches' },
  { key: 'prune', before: 'two-sheets', after: 'one-sheet' },
] as const;

/**
 * "Keeping the bench clean" (Spec Option 12a): each mess from the rot grid, dulled, turns into its clean state through
 * one verb pill, four columns in Slide 11's order, with the fresh chat as a dark band underneath. Overrules
 * `grid-2x2` so each mess carries across; keeps `motion: none`. Hovering a column dims the others.
 */
export const keepingTheBenchClean = slide({
  slug: 'keeping-the-bench-clean',
  messages: { en, de },
  notes: [
    { slug: 'the-videos-framing', target: 'framing', sources: [IBM] },
    { slug: 'breunig-lists-other-fixes', target: 'others', sources: [BREUNIG_FIX] },
    { slug: 'one-fix-per-mode-is-a-simplification', target: 'compact', sources: [ANTHROPIC] },
  ],
  segments: [{ slug: 'four-cleanups' }, { slug: 'fresh-chat' }],
  content: ({ t, locale, target, Marker }) => (
    <SlideFrame className="@container mt-8 gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-caption text-muted-foreground">
        <span {...target('framing')} className="inline-flex items-center gap-1">
          {t('framing')}
          <Marker note="the-videos-framing" placement="beside" />
        </span>
        <span {...target('others')} className="inline-flex items-center gap-1">
          {t('others')}
          <Marker note="breunig-lists-other-fixes" placement="beside" />
        </span>
      </div>
      <div className="focus-group focus-group--dim-others grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-4">
        {FIXES.map(({ key, before, after }) => (
          <FixColumn
            key={key}
            fix={key}
            mess={t(`fixes.${key}.mess`)}
            verb={t(`fixes.${key}.verb`)}
            how={t(`fixes.${key}.how`)}
            before={{ id: before, label: t(`fixes.${key}.before`) }}
            after={{ id: after, label: t(`fixes.${key}.after`) }}
            {...(key === 'compact' && {
              target: target('compact'),
              marker: <Marker note="one-fix-per-mode-is-a-simplification" placement="beside" />,
            })}
          />
        ))}
      </div>
      <FreshBench
        label={t('fresh.label')}
        text={t('fresh.text')}
        old={{ caption: t('fresh.old'), bars: <ContextBarsPreset preset="slide-10-old" locale={locale} /> }}
        fresh={{ caption: t('fresh.new'), bars: <ContextBarsPreset preset="slide-10-fresh" locale={locale} /> }}
      />
    </SlideFrame>
  ),
});
