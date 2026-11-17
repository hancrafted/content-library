import type { TagId } from '@/content-store/schemas/fields';
import { TAG_ICONS, tagToken } from '@/content-store/schemas/tag-looks';
import { BadgeList } from '@/shared/components/ui/badge-list';
import { CardArtwork, type CardArtworkName } from '@/shared/components/ui/card-artwork';
import { CardCaption, CardCue, CardShell, CardTitle } from '@/shared/components/ui/card-shell';
import { NAMED_ICONS } from '@/shared/components/ui/named-icons';
import type { Locale } from '@/shared/lib/locale.pure';

// decision: FE-006 §4
export interface ExplorableCard {
  readonly slug: string;
  readonly route: string;
  readonly typeLabel: string;
  readonly artwork: CardArtworkName;
  readonly title: string;
  readonly description: string;
  readonly leadTag: TagId;
  readonly tags: readonly { readonly id: TagId; readonly label: string; readonly tooltip: string }[];
}

interface CardViewProps {
  card: ExplorableCard;
  locale: Locale;
  open: string;
  className?: string;
}

export function ExplorableCardView(props: CardViewProps) {
  const { card, className } = props;
  return (
    <CardShell
      variant="compact"
      linked
      accent={tagToken(card.leadTag)}
      icon={NAMED_ICONS[TAG_ICONS[card.leadTag]]}
      visual={<CardArtwork name={card.artwork} />}
      visualPosition="top"
      ink
      className={className}
      data={{ 'data-explorable-card': card.slug, 'data-lead-tag': card.leadTag }}
    >
      <ExplorableCardBody {...props} />
    </CardShell>
  );
}

function ExplorableCardBody({ card, locale, open }: CardViewProps) {
  return (
    <>
      <ExplorableCategory card={card} />
      <CardTitle variant="compact" title={card.title} route={card.route} locale={locale} level={2} graphic />
      <CardCaption variant="compact" graphic>
        {card.description}
      </CardCaption>
      <div data-card-meta className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <BadgeList items={card.tags.slice(1)} data={{ 'data-explorable-tags': '' }} />
      </div>
      <div data-card-footer className="mt-auto flex min-h-11 flex-wrap items-center justify-end gap-2 pt-4">
        <CardCue cue="button" variant="compact" open={open} comingSoon="" ink />
      </div>
    </>
  );
}

function ExplorableCategory({ card }: { card: ExplorableCard }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-caption font-medium">
      <span className="text-muted-foreground">{card.typeLabel}</span>
      <span
        data-tag={card.leadTag}
        title={card.tags[0]?.tooltip}
        className="inline-flex items-center gap-2 text-(--card-accent)"
      >
        <span aria-hidden className="size-1.5 rounded-full bg-current" />
        {card.tags[0]?.label}
      </span>
    </div>
  );
}
