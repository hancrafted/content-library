import type { IsoDate } from '@/content-store/schemas/fields';
import { isPastEvent } from '@/lib/events.pure';
import { cn } from '@/lib/utils';
import { History } from 'lucide-react';

interface PastNoticeProps {
  /** The Event's date. */
  date: IsoDate;
  /** The day the page is built; an Event dated before it is past. */
  buildDay: IsoDate;
  /** The fixed line, read from `eventsPage.pastNotice` in the page's locale. */
  text: string;
  className?: string;
}

/**
 * The past Event's notice (design-ADR 0016, Past Event): one fixed line saying the content is kept up to date and may
 * differ from the recording, as a bordered, warning-tinted note. It sits above the Playlist on the Event page; an
 * upcoming Event renders nothing. Not dismissible, no date.
 */
export function PastNotice({ date, buildDay, text, className }: PastNoticeProps) {
  if (!isPastEvent(date, buildDay)) return null;
  return (
    <p
      role="note"
      data-past-notice
      className={cn(
        'flex items-start gap-3 rounded-lg border border-(--warning) bg-(--warning)/10 px-4 py-3 text-body text-foreground',
        className,
      )}
    >
      <History aria-hidden className="mt-1 size-4 shrink-0 text-(--warning)" />
      <span>{text}</span>
    </p>
  );
}
