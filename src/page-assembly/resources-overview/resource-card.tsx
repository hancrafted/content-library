import type { TagId } from '@/content-store/schemas/fields';
import { TAG_ICONS, tagToken } from '@/content-store/schemas/tag-looks';
import { DriftStill } from '@/episodes/components/slide-shared/explorable-hero/drift-still';
import type { Story } from '@/episodes/components/slide-shared/explorable-hero/drift.pure';
import { BadgeList } from '@/shared/components/ui/badge-list';
import { CardArrow, CardCaption, CardShell, CardTitle } from '@/shared/components/ui/card-shell';
import { NAMED_ICONS } from '@/shared/components/ui/named-icons';
import type { Locale } from '@/shared/lib/locale.pure';

/**
 * One Resource as its card draws it, strings read in one locale on the server: plain values only, so the client
 * leaf can take it (FE-006 §4).
 */
export interface ResourceCard {
  readonly slug: string;
  /** The Resource page's locale-neutral logical path. */
  readonly route: string;
  readonly kind: string;
  /** The kind's name in the reader's locale ("Master slide"). */
  readonly kindLabel: string;
  /** The Message drift an Explorable page's card stills in its media strip; other kinds have none. */
  readonly story?: Story;
  readonly title: string;
  readonly description: string;
  /** The Resource's first Tag, which gives its card the icon and accent. */
  readonly leadTag: TagId;
  readonly tags: readonly { readonly id: TagId; readonly label: string; readonly tooltip: string }[];
}

interface CardViewProps {
  card: ResourceCard;
  locale: Locale;
  className?: string;
}

function dataOf(card: ResourceCard) {
  return { 'data-resource-card': card.slug, 'data-resource-kind': card.kind, 'data-lead-tag': card.leadTag };
}

/**
 * One Resource as a card, laid out as an Episode card is: the lead Tag's icon and accent, its kind, the title as the
 * card's one link, the description, the Tags and the cue that it opens.
 */
export function ResourceCardView({ card, locale, className }: CardViewProps) {
  return (
    <CardShell
      variant="compact"
      linked
      accent={tagToken(card.leadTag)}
      icon={NAMED_ICONS[TAG_ICONS[card.leadTag]]}
      media={card.story && <DriftStill story={card.story} className="size-full" />}
      className={className}
      data={dataOf(card)}
    >
      <p data-resource-kind-label className="text-caption font-medium tracking-widest text-muted-foreground uppercase">
        {card.kindLabel}
      </p>
      <CardTitle variant="compact" title={card.title} route={card.route} locale={locale} level={2} />
      <CardCaption variant="compact">{card.description}</CardCaption>
      <BadgeList items={card.tags} data={{ 'data-resource-tags': '' }} />
      <div className="mt-auto flex min-h-11 items-center justify-end pt-2">
        <CardArrow variant="compact" />
      </div>
    </CardShell>
  );
}
