import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ExplorableHero } from '@/episodes/components/slide-shared/explorable-hero/explorable-hero';
import { ToolPreview } from '@/episodes/components/slide-shared/explorable-hero/tool-preview';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The window bar's parts, widest last: the share of the window each takes and how strongly `foreground` shows. */
const PARTS = [
  { key: 'system', share: 7, tone: 'bg-foreground/80' },
  { key: 'memory', share: 5, tone: 'bg-foreground/60' },
  { key: 'chat', share: 22, tone: 'bg-foreground/40' },
  { key: 'search', share: 12, tone: 'bg-foreground/20' },
  { key: 'rest', share: 18, tone: 'bg-foreground/45' },
] as const;

/** Attention per message: high at both ends, a dip in the middle. */
const ATTENTION = [
  100, 83, 69, 59, 51, 44, 39, 36, 33, 30, 28, 27, 26, 25, 24, 24, 24, 25, 26, 27, 30, 33, 37, 43, 51, 62, 78, 100,
];

/**
 * The Title slide's hero Scene for the Context window page (the record's `title`): its own headline and lede, the
 * Explorable hero over a drift of bubbles in which one turns orange and is forgotten in the middle, and a preview of
 * the window bar and the attention chart.
 */
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t, locale, slideHref }) => (
    <ExplorableHero
      layers={{ Backdrop: SlideBackdrop, Frame: SlideFrame }}
      story="context-window"
      locale={locale}
      tryIt={{ label: t('tryIt'), href: slideHref('every-part-and-control') }}
      why={{ label: t('why'), href: slideHref('why-how-what') }}
      share={{
        title: t('share.title'),
        text: t('share.text'),
        labels: { copy: t('share.copy'), copied: t('share.copied') },
      }}
      motion={{ pause: t('motion.pause'), play: t('motion.play'), stilled: t('motion.stilled') }}
      preview={
        <ToolPreview label={t('preview.label')} title={t('preview.title')} tag={t('preview.tag')}>
          <p className="mb-1.5 uppercase tracking-wide text-muted-foreground">{t('preview.window')}</p>
          <div className="flex h-9 overflow-hidden rounded-lg border border-border">
            {PARTS.map(({ key, share, tone }) => (
              <span key={key} className={`${tone} h-full border-r-2 border-card`} style={{ flex: `${share} 0 0` }} />
            ))}
            <span className="h-full flex-1" />
          </div>
          <p className="mt-4 mb-1.5 uppercase tracking-wide text-muted-foreground">{t('preview.attention')}</p>
          <div className="flex h-18 items-end gap-0.5">
            {ATTENTION.map((height, index) => (
              <span key={index} className="flex-1 rounded-t-sm bg-primary" style={{ height: `${height}%` }} />
            ))}
          </div>
        </ToolPreview>
      }
    />
  ),
});
