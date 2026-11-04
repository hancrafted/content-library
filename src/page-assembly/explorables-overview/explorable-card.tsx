import type { TagId } from '@/content-store/schemas/fields';
import { TAG_ICONS, tagToken } from '@/content-store/schemas/tag-looks';
import { DriftStill } from '@/episodes/components/slide-shared/explorable-hero/drift-still';
import type { Story } from '@/episodes/components/slide-shared/explorable-hero/drift.pure';
import { BadgeList } from '@/shared/components/ui/badge-list';
import { CardCaption, CardCue, CardShell, CardTitle } from '@/shared/components/ui/card-shell';
import { NAMED_ICONS } from '@/shared/components/ui/named-icons';
import type { Locale } from '@/shared/lib/locale.pure';

/** One Explorable page as its card draws it, strings read in one locale on the server: plain values only (FE-006 §4). */
export interface ExplorableCard {
  readonly slug: string;
  /** The Explorable page's locale-neutral logical path. */
  readonly route: string;
  /** The kind's name in the reader's locale ("Explorable"). */
  readonly typeLabel: string;
  /** Which Message drift the card's top artwork stills. */
  readonly story: Story;
  readonly title: string;
  readonly description: string;
  /** The page's first Tag, which gives its card the icon and accent. */
  readonly leadTag: TagId;
  readonly tags: readonly { readonly id: TagId; readonly label: string; readonly tooltip: string }[];
}

interface CardViewProps {
  card: ExplorableCard;
  locale: Locale;
  open: string;
  className?: string;
}

/** One Explorable page with top artwork, a clean reading surface and native whole-card navigation. */
export function ExplorableCardView(props: CardViewProps) {
  const { card, className } = props;
  return (
    <CardShell
      variant="compact"
      linked
      accent={tagToken(card.leadTag)}
      icon={NAMED_ICONS[TAG_ICONS[card.leadTag]]}
      visual={<DriftStill story={card.story} />}
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
