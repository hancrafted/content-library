/** A person, in the meaning colour `human`, standing with their feet at `y`. */
export function Person({ cx, y }: { cx: number; y: number }) {
  return (
    <g data-person>
      <circle cx={cx} cy={y - 18.6} r={4.34} className="fill-human" />
      <path d={`M${cx - 6.82} ${y} Q${cx} ${y - 26.04} ${cx + 6.82} ${y} Z`} className="fill-human" />
    </g>
  );
}
