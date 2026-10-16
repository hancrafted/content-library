/** The "ask about the last time" exchange: the question asked, the answer given. */
export function Exchange({ ask, answer }: { ask: string; answer: string }) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      <p className="self-start rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-caption">{ask}</p>
      <p className="self-end rounded-2xl rounded-br-sm border bg-card px-3 py-2 text-caption shadow-sm">{answer}</p>
    </div>
  );
}

/** What a note is relevant to, as chips; a dropped one is struck through. */
export function Chips({ items }: { items: { label: string; dropped?: boolean }[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2 text-caption">
      {items.map(({ label, dropped }) => (
        <li key={label} className="rounded-full border px-3 py-0.5">
          {dropped ? <s className="text-muted-foreground">{label}</s> : label}
        </li>
      ))}
    </ul>
  );
}

const DOTS = [52, 100, 148] as const;

/** The first hire branching into a team of three. */
function TeamBranch({ label }: { label: string }) {
  return (
    <g>
      <path
        d="M148 62 V66 M148 94 V100 M148 100 C 148 114, 52 110, 52 134 M148 100 C 148 114, 100 110, 100 134 M148 100 V134"
        className="fill-none stroke-muted-foreground"
        strokeWidth="2"
      />
      {DOTS.map((cx) => (
        <circle key={cx} cx={cx} cy="148" r="12" className="fill-muted-foreground/40" />
      ))}
      <text x="100" y="184" textAnchor="middle" className="fill-muted-foreground text-caption">
        {label}
      </text>
    </g>
  );
}

/** You, repeated by a first sales hire, branching into a team: portrait, so its labels stay readable in a narrow note. */
export function RepeatPath({ you, repeat, hire, team }: { you: string; repeat: string; hire: string; team: string }) {
  const label = 'fill-muted-foreground text-caption';
  return (
    <svg viewBox="0 0 200 190" className="mt-4 w-full max-w-56" aria-hidden="true">
      <circle cx="30" cy="40" r="22" className="fill-foreground" />
      <text x="30" y="45" textAnchor="middle" className="fill-background text-caption font-semibold">
        {you}
      </text>
      <g className="fill-none stroke-foreground" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M58 40 H116" strokeDasharray="6 5" strokeLinecap="butt" />
        <path d="M110 33 L120 40 L110 47" />
      </g>
      <text x="87" y="28" textAnchor="middle" className={label}>
        {repeat}
      </text>
      <circle cx="148" cy="40" r="22" className="fill-card stroke-foreground" strokeWidth="2" strokeDasharray="5 4" />
      <text x="120" y="84" textAnchor="middle" className={label}>
        {hire}
      </text>
      <TeamBranch label={team} />
    </svg>
  );
}
