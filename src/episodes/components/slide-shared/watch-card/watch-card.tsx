import { BadgeList } from '@/shared/components/ui/badge-list';
import { CardCaption, CardShell, CardTitle } from '@/shared/components/ui/card-shell';
import { NAMED_ICONS } from '@/shared/components/ui/named-icons';
import type { Locale } from '@/shared/lib/locale.pure';

/** One Episode as the card the Episode overview draws, with its words already in the reader's language. */
export interface WatchCardProps {
  readonly title: string;
  readonly caption: string;
  readonly tags: readonly { readonly id: string; readonly label: string }[];
  /** The release day, `YYYY-MM-DD`, machine-readable in `dateTime`. */
  readonly day: string;
  /** The release day as the reader's locale writes it. */
  readonly dateLabel: string;
  /** The locale-neutral path of the Episode the card opens. */
  readonly route: string;
  readonly locale: Locale;
}

/**
 * An Episode card in the overview's style (accent wash, faded hourglass, title, caption, Tags, date), drawn from plain
 * props so a Slide can show an Episode of another Event without reading the content store.
 */
export function WatchCard({ title, caption, tags, day, dateLabel, route, locale }: WatchCardProps) {
  return (
    <CardShell
      variant="compact"
      linked
      accent="--tag-context-engineering"
      icon={NAMED_ICONS.hourglass}
      data={{ 'data-watch-card': '' }}
    >
      <CardTitle variant="compact" title={title} route={route} locale={locale} level={4} />
      <CardCaption variant="compact">{caption}</CardCaption>
      <BadgeList items={tags} data={{ 'data-watch-tags': '' }} />
      <time dateTime={day} className="mt-auto pt-2 text-caption text-muted-foreground">
        {dateLabel}
      </time>
    </CardShell>
  );
}
