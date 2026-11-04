import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './card-visual.module.css';

export type CardVisualPosition = 'left' | 'right' | 'top' | 'bottom' | 'none';

/** Visual order is presentation only: the reading surface retains its natural heading and action order. */
export function CardVisual({ visual, children }: { visual?: ReactNode; children: ReactNode }) {
  return (
    <>
      {visual && (
        <div aria-hidden data-card-visual className={styles.panel}>
          {visual}
        </div>
      )}
      <div data-card-body className={styles.body}>
        {children}
      </div>
    </>
  );
}

interface PictureProps {
  media?: ReactNode;
  linked: boolean;
  icon: LucideIcon;
  classes: { art: string; media: string };
  accent: { wash: string; ink: string };
}

/** Existing non-graphic cards retain their own static media or corner illustration. */
export function CardPicture(props: PictureProps) {
  if (!props.media) return props.linked && <CardArt {...props} />;
  return (
    <div
      aria-hidden
      data-card-media
      className={`h-24 shrink-0 overflow-hidden bg-primary text-primary-foreground dark:border-b dark:border-border/60 dark:bg-background dark:text-foreground ${props.classes.media}`}
    >
      {props.media}
    </div>
  );
}

function CardArt({ icon: Icon, classes, accent }: PictureProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 bg-linear-to-br ${accent.wash} via-transparent to-transparent`}
      />
      <Icon
        aria-hidden
        className={`pointer-events-none absolute -z-10 opacity-[0.08] transition-transform duration-500 motion-safe:group-hover:-rotate-3 motion-safe:group-hover:scale-105 motion-reduce:transition-none ${accent.ink} ${classes.art}`}
      />
    </div>
  );
}
