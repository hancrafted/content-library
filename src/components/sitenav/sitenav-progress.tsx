import { cn } from '@/lib/utils';
import type { SitenavSkin } from './sitenav-skins';

function RidingCounter({ className, progress }: { className: string; progress: number }) {
  return (
    <span
      aria-hidden
      className={cn('absolute transition-[top] duration-150 ease-out motion-reduce:transition-none', className)}
      style={{ top: `${progress}%` }}
    >
      {progress}%
    </span>
  );
}

/**
 * A vertical track along the panel edge, filled to `progress` percent. The
 * fill scales on the compositor; the riding counter, when the skin has one,
 * follows the fill's leading edge.
 */
export function SitenavProgress({ skin, progress, label }: { skin: SitenavSkin; progress: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      className={cn('absolute', skin.track)}
    >
      <div
        className={cn(
          'h-full w-full origin-top transition-transform duration-150 ease-out motion-reduce:transition-none',
          skin.fill,
        )}
        style={{ transform: `scaleY(${progress / 100})` }}
      />
      {skin.ridingCounter && <RidingCounter className={skin.ridingCounter} progress={progress} />}
    </div>
  );
}
