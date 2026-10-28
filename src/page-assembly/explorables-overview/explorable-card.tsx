import type { TagId } from '@/content-store/schemas/fields';
import { TAG_ICONS, tagToken } from '@/content-store/schemas/tag-looks';
import { BadgeList } from '@/shared/components/ui/badge-list';
import { CardArrow, CardCaption, CardShell, CardTitle } from '@/shared/components/ui/card-shell';
import { NAMED_ICONS } from '@/shared/components/ui/named-icons';
import type { Locale } from '@/shared/lib/locale.pure';

/** One Explorable page as its card draws it, strings read in one locale on the server: plain values only (FE-006 §4). */
export interface ExplorableCard {
  readonly slug: string;
  /** The Explorable page's locale-neutral logical path. */
  readonly route: string;
  /** The kind's name in the reader's locale ("Explorable"). */
  readonly typeLabel: string;
  readonly title: string;
  readonly description: string;
  /** The page's first Tag, which gives its card the icon and accent. */
  readonly leadTag: TagId;
  readonly tags: readonly { readonly id: TagId; readonly label: string; readonly tooltip: string }[];
}

/** One Explorable page as a card, laid out as an Episode card is: lead Tag icon and accent, title as the one link, description, Tags. */
export function ExplorableCardView({
  card,
  locale,
  className,
}: {
  card: ExplorableCard;
  locale: Locale;
  className?: string;
}) {
  return (
    <CardShell
      variant="compact"
      linked
      accent={tagToken(card.leadTag)}
      icon={NAMED_ICONS[TAG_ICONS[card.leadTag]]}
      className={className}
      data={{ 'data-explorable-card': card.slug, 'data-lead-tag': card.leadTag }}
    >
      <p className="text-caption font-medium tracking-widest text-muted-foreground uppercase">{card.typeLabel}</p>
      <CardTitle variant="compact" title={card.title} route={card.route} locale={locale} level={2} />
      <CardCaption variant="compact">{card.description}</CardCaption>
      <BadgeList items={card.tags} data={{ 'data-explorable-tags': '' }} />
      <div className="mt-auto flex min-h-11 items-center justify-end pt-2">
        <CardArrow variant="compact" />
      </div>
    </CardShell>
  );
}
