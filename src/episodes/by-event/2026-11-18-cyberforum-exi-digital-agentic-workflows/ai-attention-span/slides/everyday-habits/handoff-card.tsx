import type { ReactNode } from 'react';
import styles from './everyday-habits.module.css';

const CARD =
  'card-hover card-hover--raise flex flex-col gap-2 rounded-2xl border-2 border-primary bg-card p-5 shadow-md';

export function HandoffCard({ title, text }: { title: string; text: ReactNode }) {
  return (
    <div data-handoff className={`${styles.card} ${CARD} max-w-xs`}>
      <p className="text-caption font-semibold text-primary uppercase">{title}</p>
      <p className="text-caption">{text}</p>
    </div>
  );
}
