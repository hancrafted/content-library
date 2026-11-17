import type { TagId } from '@/content-store/schemas/fields';
import { TAG_ARTWORK, TAG_ICONS, tagToken } from '@/content-store/schemas/tag-looks';
import { BadgeList } from '@/shared/components/ui/badge-list';
import { CardArtwork, type CardArtworkName } from '@/shared/components/ui/card-artwork';
import { CardCaption, CardCue, CardShell, CardTitle } from '@/shared/components/ui/card-shell';
import { NAMED_ICONS } from '@/shared/components/ui/named-icons';
import type { Locale } from '@/shared/lib/locale.pure';
import type { ResourceKind } from './resource-index.pure';

// decision: FE-006 §4
export interface ResourceCard {
  readonly slug: string;
  readonly route: string;
  readonly kind: ResourceKind;
  readonly kindLabel: string;
  readonly artwork?: CardArtworkName;
  readonly title: string;
  readonly description: string;
  readonly leadTag: TagId;
  readonly tags: readonly { readonly id: TagId; readonly label: string; readonly tooltip: string }[];
}

interface CardViewProps {
  card: ResourceCard;
  locale: Locale;
  open: string;
  className?: string;
}

function dataOf(card: ResourceCard) {
  return { 'data-resource-card': card.slug, 'data-resource-kind': card.kind, 'data-lead-tag': card.leadTag };
}

export function ResourceCardView(props: CardViewProps) {
  const { card, className } = props;
  const visual = resourceVisual(card);
  return (
    <CardShell
      variant="compact"
      linked
      accent={tagToken(card.leadTag)}
      icon={NAMED_ICONS[TAG_ICONS[card.leadTag]]}
      visual={visual}
      visualPosition={visual ? (card.kind === 'explorable-page' ? 'top' : 'left') : 'none'}
      ink
      className={className}
      data={dataOf(card)}
    >
      <ResourceCardBody {...props} />
    </CardShell>
  );
}

function resourceVisual(card: ResourceCard) {
  if (card.kind === 'episode' || card.kind === 'event') return <CardArtwork name={TAG_ARTWORK[card.leadTag]} />;
  if (card.kind === 'explorable-page' && card.artwork) return <CardArtwork name={card.artwork} />;
  return undefined;
}

function ResourceCardBody({ card, locale, open }: CardViewProps) {
  return (
    <>
      <ResourceCategory card={card} />
      <CardTitle variant="compact" title={card.title} route={card.route} locale={locale} level={2} graphic />
      <CardCaption variant="compact" graphic>
        {card.description}
      </CardCaption>
      <div data-card-meta className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <BadgeList items={card.tags.slice(1)} data={{ 'data-resource-tags': '' }} />
      </div>
      <div data-card-footer className="mt-auto flex min-h-11 flex-wrap items-center justify-end gap-2 pt-4">
        <CardCue cue="button" variant="compact" open={open} comingSoon="" ink />
      </div>
    </>
  );
}

function ResourceCategory({ card }: { card: ResourceCard }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-caption font-medium">
      <span data-resource-kind-label className="text-muted-foreground">
        {card.kindLabel}
      </span>
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
