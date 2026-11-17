import { routeOf } from '@/content-store/catalogue/record-routes';
import { TAG_ICONS, tagToken } from '@/content-store/schemas/tag-looks';
import { guideVideo, listedGuides } from '@/content-store/store';
import { summaryOf } from '@/episodes/lib/page-summary';
import { PAGE_WORDS } from '@/page-assembly/lib/page-words';
import { PAGE_CONTAINER, PageHeader } from '@/shared/components/page-header';
import { BadgeList } from '@/shared/components/ui/badge-list';
import { CARD_GRID } from '@/shared/components/ui/card-grid';
import { CardCaption, CardCue, CardShell, CardTitle } from '@/shared/components/ui/card-shell';
import { NAMED_ICONS } from '@/shared/components/ui/named-icons';
import { YoutubeLink, type VideoLabels } from '@/shared/components/ui/youtube-link';
import type { Locale } from '@/shared/lib/locale.pure';
import { cn } from '@/shared/lib/utils';
import { getTranslations } from 'next-intl/server';

function guideCards(locale: Locale) {
  const tagWords = PAGE_WORDS[locale].tags;
  return listedGuides().map(({ page, tags }) => {
    const { title, description } = summaryOf(page.guide)[locale];
    const video = guideVideo(page.guide.slug, locale);
    return {
      slug: page.guide.slug,
      route: routeOf(page),
      title,
      description,
      youtubeUrl: video === undefined ? undefined : `https://www.youtube.com/watch?v=${video.id}`,
      leadTag: tags[0],
      tags: tags.map((id) => ({ id, label: tagWords[id].name, tooltip: tagWords[id].tooltip })),
    };
  });
}

type GuideCard = ReturnType<typeof guideCards>[number];

interface GuideCardViewProps {
  card: GuideCard;
  kindLabel: string;
  locale: Locale;
  videoLabels: VideoLabels;
  open: string;
}

function GuideCardView({ card, kindLabel, locale, videoLabels, open }: GuideCardViewProps) {
  return (
    <CardShell
      variant="compact"
      linked
      visualPosition="none"
      ink
      accent={tagToken(card.leadTag)}
      icon={NAMED_ICONS[TAG_ICONS[card.leadTag]]}
      className="w-full"
      data={{ 'data-guide-card': card.slug, 'data-lead-tag': card.leadTag }}
    >
      <p className="text-caption font-medium tracking-widest text-muted-foreground uppercase">{kindLabel}</p>
      <CardTitle variant="compact" graphic title={card.title} route={card.route} locale={locale} level={2} />
      <CardCaption variant="compact" graphic>
        {card.description}
      </CardCaption>
      <BadgeList items={card.tags} data={{ 'data-guide-tags': '' }} />
      <div className="mt-auto flex min-h-11 flex-wrap items-center justify-end gap-2 pt-2">
        <YoutubeLink url={card.youtubeUrl} labels={videoLabels} labelled data={{ 'data-guide-video': '' }} />
        <CardCue variant="compact" cue="button" open={open} comingSoon="" ink />
      </div>
    </CardShell>
  );
}

// decision: docs/adr/0019-resources-overview.md
export async function GuidesOverviewPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'guidesOverview' });
  const cards = guideCards(locale);
  return (
    <main data-testid="guides-index-page" className={PAGE_CONTAINER}>
      <PageHeader title={t('title')} intro={<p>{t('intro')}</p>} />
      {cards.length === 0 ? (
        <p>{t('none')}</p>
      ) : (
        <ul className={cn(CARD_GRID, 'list-none p-0')}>
          {cards.map((card) => (
            <li key={card.slug} className="flex">
              <GuideCardView
                card={card}
                kindLabel={t('typeLabel')}
                locale={locale}
                videoLabels={{ watchVideo: t('watchVideo'), newTab: t('newTab') }}
                open={t('open')}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
