import { slide } from '@/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/components/slide-master/slide-master';
import { VisitorBadge } from '@/components/slide-shared/visitor-badge/visitor-badge';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The Title slide's hero Scene (the record's `title`), the Hero motif: three visitor badges, one per job, and every
 * one says Day 1. The two behind fade and tilt away; the front one, worn by AI, is the one focal point, raised on
 * hover so the presenter can point at it. The side note says what the row shows. Each section slide echoes the badge.
 * The empty Backdrop is the Title slide's one Backdrop, holding no glow.
 */
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t }) => (
    <>
      <SlideBackdrop mobile />
      <SlideFrame className="mt-10">
        <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-12">
          <ol className="flex items-end justify-center gap-4 md:col-span-9" aria-label={t('badgeRow')}>
            <li className="w-1/4 -rotate-3 opacity-50" data-a11y-decorative>
              <VisitorBadge
                job={t('badges.monday.job')}
                weekday={t('badges.monday.weekday')}
                day={t('badges.monday.day')}
                task={t('badges.monday.task')}
                ai
              />
            </li>
            <li className="w-1/4 -rotate-1 opacity-75" data-a11y-decorative>
              <VisitorBadge
                job={t('badges.tuesday.job')}
                weekday={t('badges.tuesday.weekday')}
                day={t('badges.tuesday.day')}
                task={t('badges.tuesday.task')}
                ai
              />
            </li>
            <li className="w-2/5 rotate-1">
              <VisitorBadge
                job={t('badges.wednesday.job')}
                weekday={t('badges.wednesday.weekday')}
                day={t('badges.wednesday.day')}
                facts={(['trades', 'company', 'tuesday'] as const).map((slug) => ({
                  slug,
                  term: t(`badgeFacts.${slug}.term`),
                  value: t(`badgeFacts.${slug}.value`),
                }))}
                ai
                focus
              />
            </li>
          </ol>
          <p className="border-border text-body text-muted-foreground md:col-span-3 md:border-l md:pb-6 md:pl-6">
            {t.rich('sideNote', {
              day: (chunks: ReactNode) => (
                <span className="font-semibold whitespace-nowrap text-foreground">{chunks}</span>
              ),
            })}
          </p>
        </div>
      </SlideFrame>
    </>
  ),
});
