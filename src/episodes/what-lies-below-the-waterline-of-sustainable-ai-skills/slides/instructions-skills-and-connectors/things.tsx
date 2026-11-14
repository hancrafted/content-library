/*
 * The four things of the control room, each drawn once and placed at `(x, y)` with a `scale`, so the opening room and
 * the four cartoon panels show the same notebook, brief, manual and cable. SVG groups in the Scene's units.
 */

interface Place {
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
}

const place = ({ x, y, scale = 1 }: Place) => `translate(${x} ${y}) scale(${scale})`;

/** Your notebook of standing orders; `(0, 0)` is its bottom-left corner. */
export function Notebook(props: Place) {
  return (
    <g data-notebook transform={place(props)}>
      <polygon points="0,0 0,-56 40,-60 40,-4" className="fill-(--notebook)" />
      <polygon points="40,-4 40,-60 46,-58 46,-2" className="fill-(--paper-shade)" />
      <rect x={10} y={-48} width={22} height={6} className="fill-(--paper)" />
    </g>
  );
}

/** The project brief pinned on the wall, with a small chart; `(0, 0)` is its top-left corner. */
export function WallBrief(props: Place) {
  return (
    <g data-wall-brief transform={place(props)}>
      <rect x={6} y={6} width={130} height={170} className="fill-(--paper-shade)" />
      <rect width={130} height={170} className="fill-(--paper)" />
      <rect x={58} y={-10} width={14} height={16} className="fill-(--pin)" />
      {[50, 70, 90, 110].map((y) => (
        <rect key={y} x={16} y={y} width={70} height={4} className="fill-(--ink)" />
      ))}
      <rect x={70} y={120} width={12} height={36} className="fill-(--chart-a)" />
      <rect x={86} y={100} width={12} height={56} className="fill-(--chart-a)" />
      <rect x={102} y={130} width={12} height={26} className="fill-(--chart-b)" />
    </g>
  );
}

/** The manual, a binder with card tabs, standing on the console; `(0, 0)` is its bottom-left corner. */
export function Manual(props: Place) {
  return (
    <g data-manual transform={place(props)}>
      <rect x={0} y={-100} width={60} height={100} className="fill-(--book)" />
      <rect x={0} y={-100} width={14} height={100} className="fill-(--book-lit)" />
      <rect x={24} y={-80} width={28} height={14} className="fill-(--paper)" />
      {[-90, -70, -50, -30].map((y, n) => (
        <rect
          key={y}
          x={60}
          y={y}
          width={8}
          height={12}
          className={['fill-(--tab-a)', 'fill-(--tab-b)', 'fill-(--tab-c)'][n % 3]}
        />
      ))}
    </g>
  );
}

/** The lab database's rack in the next room; `(0, 0)` is its top-left corner. */
export function LabRack(props: Place) {
  return (
    <g data-lab-rack transform={place(props)}>
      <rect width={110} height={170} className="fill-(--rack)" />
      {[12, 50, 88, 126].map((y) => (
        <g key={y}>
          <rect x={10} y={y} width={84} height={30} className="fill-(--rack-face)" />
          <rect x={98} y={y + 10} width={6} height={6} className="fill-(--rack-led)" />
        </g>
      ))}
    </g>
  );
}

/** The towed sonar under water, sending its pings down; `(0, 0)` is its nose. */
export function Sonar(props: Place) {
  return (
    <g data-sonar transform={place(props)}>
      <polygon points="0,0 30,-14 110,-12 130,-26 130,14 110,8 30,12" className="fill-(--sonar)" />
      {[24, 40, 56].map((r) => (
        <path
          key={r}
          d={`M${60 - r} ${18 + r / 3} Q60 ${18 + r} ${60 + r} ${18 + r / 3}`}
          strokeWidth={3}
          className="fill-none stroke-(--ping)"
        />
      ))}
    </g>
  );
}

/** The cable, as a list of points in the Scene's units. */
export function Cable({ points }: { readonly points: readonly (readonly [number, number])[] }) {
  return (
    <polyline
      data-cable
      points={points.map(([x, y]) => `${x},${y}`).join(' ')}
      strokeWidth={8}
      strokeLinejoin="round"
      className="fill-none stroke-(--cable)"
    />
  );
}
