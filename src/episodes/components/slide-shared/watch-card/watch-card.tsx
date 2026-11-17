import { BadgeList } from '@/shared/components/ui/badge-list';
import { CardCaption, CardShell, CardTitle } from '@/shared/components/ui/card-shell';
import { NAMED_ICONS } from '@/shared/components/ui/named-icons';
import type { Locale } from '@/shared/lib/locale.pure';

export interface WatchCardProps {
  readonly title: string;
  readonly caption: string;
  readonly tags: readonly { readonly id: string; readonly label: string }[];
  readonly day: string;
  readonly dateLabel: string;
  readonly route: string;
  readonly locale: Locale;
}

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
