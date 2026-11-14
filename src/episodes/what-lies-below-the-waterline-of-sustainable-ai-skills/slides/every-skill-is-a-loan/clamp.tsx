import styles from './loan.module.css';

export type ClampIcon = 'written' | 'sites' | 'arm' | 'overlap';

/** Each clamp's glyph, in the clamp's own 56 by 56 units: the skill's card, the site list, the arm, two cards. */
const GLYPHS: Record<ClampIcon, readonly string[]> = {
  written: ['M20 15h16v26H20z', 'M24 22h8', 'M24 28h8', 'M24 34h5'],
  sites: ['M19 19h18', 'M19 27h18', 'M19 35h18', 'M17 38l22-22'],
  arm: ['M16 40l10-14 12 4', 'M38 30l4-6', 'M38 30l5 3'],
  overlap: ['M15 18h16v20H15z', 'M24 24h16v20H24z'],
};

/** One hexagonal clamp on the robot's cable, holding its entry's glyph. */
export function Clamp({ icon, label }: { readonly icon: ClampIcon; readonly label: string }) {
  return (
    <svg viewBox="0 0 56 56" role="img" aria-label={label} className="relative z-10 size-14 shrink-0">
      <polygon points="28,3 50,15.5 50,40.5 28,53 6,40.5 6,15.5" className={styles.clamp} />
      {GLYPHS[icon].map((d) => (
        <path key={d} d={d} className={styles.glyph} />
      ))}
    </svg>
  );
}
