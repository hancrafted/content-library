import styles from './slide.module.css';

/** The written card, pinned to the control-room wall: the skill, still there the next morning. */
export function PinnedCard({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <g data-pinned-card transform={`translate(${x} ${y})`} className={styles.pinnedCard}>
      <rect width={26} height={34} className={styles.paper} />
      {[9, 15, 21, 27].map((lineY) => (
        <line key={lineY} x1={5} y1={lineY} x2={21} y2={lineY} className={styles.paperLine} />
      ))}
      <circle cx={13} cy={3} r={2.2} className={styles.pin} />
    </g>
  );
}
