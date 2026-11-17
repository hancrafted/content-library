import { Frame } from '@/episodes/components/slide-shared/exhibition/frame';
import { WallLabel } from '@/episodes/components/slide-shared/exhibition/wall-label';
import { cn } from '@/shared/lib/utils';
import { RoomArt, type RoomSlug } from './room-art';

export function Room({
  slug,
  claim,
  label,
  className,
}: {
  slug: RoomSlug;
  claim: string;
  label: { title: string; era: string; line: string };
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Frame>
        <div className={cn('flex flex-col gap-2 p-4 @min-[56rem]:min-h-80', slug === 'management' && 'bg-ai/10')}>
          <RoomArt slug={slug} />
          <p className="text-body font-semibold">{claim}</p>
        </div>
      </Frame>
      <WallLabel title={label.title} era={label.era} line={label.line} className="min-h-32" />
    </div>
  );
}
