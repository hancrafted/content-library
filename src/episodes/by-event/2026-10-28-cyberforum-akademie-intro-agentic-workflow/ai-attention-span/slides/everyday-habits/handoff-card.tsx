import type { ReactNode } from 'react';
import styles from './everyday-habits.module.css';

const CARD =
  'card-hover card-hover--raise flex flex-col gap-2 rounded-2xl border-2 border-primary bg-card p-5 shadow-md';

/**
 * The handoff card the old chat hands the fresh one: its title above its text. The build notes give `text` as a
 * string; it is a node here so the budget inside it keeps the budget tint every Slide gives it. It holds nothing
 * focusable, since its motion mounts it afresh on every replay; `.card` is the CSS hook the light plays on.
 */
export function HandoffCard({ title, text }: { title: string; text: ReactNode }) {
  return (
    <div data-handoff className={`${styles.card} ${CARD} max-w-xs`}>
      <p className="text-caption font-semibold text-primary uppercase">{title}</p>
      <p className="text-caption">{text}</p>
    </div>
  );
}
