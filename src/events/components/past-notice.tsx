import type { IsoDate } from '@/content-store/schemas/fields';
import { isPastEvent } from '@/events/lib/events.pure';
import { cn } from '@/shared/lib/utils';
import { History } from 'lucide-react';

interface PastNoticeProps {
  date: IsoDate;
  buildDay: IsoDate;
  text: string;
  className?: string;
}

// decision: docs/adr/0016-content-data-model.md
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
