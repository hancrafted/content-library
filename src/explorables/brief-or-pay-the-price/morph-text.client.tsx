'use client';

import { useEffect, useState } from 'react';
import styles from './mirror.module.css';

const ROLL_MILLISECONDS = 420;
const STAGGER_MILLISECONDS = 70;

interface MorphTextProps {
  readonly text: string;
  readonly index: number;
}

export function MorphText({ text, index }: MorphTextProps) {
  const [seen, setSeen] = useState(text);
  const [from, setFrom] = useState<string | null>(null);
  if (seen !== text) {
    setSeen(text);
    setFrom(seen);
  }
  useEffect(() => {
    if (from === null) return;
    const id = window.setTimeout(() => setFrom(null), ROLL_MILLISECONDS + index * STAGGER_MILLISECONDS + 60);
    return () => window.clearTimeout(id);
  }, [from, index]);
  if (from === null) return text;
  const delay = { animationDelay: `${index * STAGGER_MILLISECONDS}ms` };
  return (
    <span className={styles.morph} data-morphing>
      <span className={styles.morphOld} style={delay} aria-hidden="true">
        {from}
      </span>
      <span className={styles.morphNew} style={delay}>
        {text}
      </span>
    </span>
  );
}
