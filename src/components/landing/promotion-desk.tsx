interface PromotionDeskProps {
  promotion: string;
  tasks: string[];
}

function TaskPaper({ task, index }: { task: string; index: number }) {
  return (
    <g data-task-paper style={{ opacity: 0 }}>
      <g transform={`translate(${152 + (index % 3) * 13} ${278 - index * 19}) rotate(${index % 2 ? 5 : -5} 140 40)`}>
        <path d="M0 7 260 0l41 54-266 14Z" fill="var(--hero-ink)" opacity=".09" transform="translate(1 5)" />
        <path d="M0 7 260 0l41 54-266 14Z" fill="var(--hero-paper)" stroke="var(--hero-line)" />
        <path d="m19 21 226-6m-211 28 100-3" stroke="var(--hero-line)" />
        <text x="43" y="39" fill="var(--hero-ink)" fontSize="12" fontFamily="monospace" transform="rotate(-2 43 39)">
          {task}
        </text>
        <path d="m254 10 8 11 12-1" stroke="var(--hero-line)" />
      </g>
    </g>
  );
}

function EnvelopeSeal({ promotion }: { promotion: string }) {
  return (
    <>
      <text
        x="112"
        y="111"
        textAnchor="middle"
        fill="var(--hero-ink)"
        fontSize="20"
        fontFamily="Georgia, serif"
        fontStyle="italic"
      >
        {promotion}
      </text>
      <g data-envelope-seal opacity="0">
        <circle cx="112" cy="76" r="16" fill="var(--hero-seal)" />
        <path d="M107 70v12m10-12v12m-10-6h10" stroke="var(--hero-paper)" strokeWidth="1.5" />
      </g>
    </>
  );
}

function Envelope({ promotion }: { promotion: string }) {
  return (
    <g data-envelope transform="translate(0 65)">
      <g transform="translate(266 134) rotate(-8 112 66)">
        <path data-envelope-open d="M0 0 109-77 224 0Z" fill="var(--hero-envelope-inner)" stroke="var(--hero-line)" />
        <rect width="224" height="138" rx="3" fill="var(--hero-envelope)" stroke="var(--hero-line)" />
        <path d="m0 0 112 79L224 0M0 138l76-71m148 71-76-71" stroke="var(--hero-line)" />
        <path
          data-envelope-flap
          d="m0 0 112 79L224 0Z"
          fill="var(--hero-envelope)"
          stroke="var(--hero-line)"
          opacity="0"
        />
        <path
          data-envelope-tear
          d="m12 0 15-4 12 6 15-5 16 5 13-6 13 5 16-4 15 5 14-6 12 5 18-3 13 4 15-5 12 3"
          stroke="var(--hero-paper)"
          strokeWidth="3"
        />
        <EnvelopeSeal promotion={promotion} />
      </g>
    </g>
  );
}

export function PromotionDesk({ promotion, tasks }: PromotionDeskProps) {
  return (
    <svg viewBox="0 0 600 480" fill="none" aria-hidden="true" className="w-full overflow-visible">
      <ellipse cx="325" cy="417" rx="230" ry="20" fill="var(--hero-ink)" opacity=".05" />
      <path d="M64 316 476 282 573 349 160 390Z" fill="var(--hero-desk)" stroke="var(--hero-line)" />
      <path d="m64 316 96 74 413-41v13l-413 42-96-75Z" fill="var(--hero-desk-edge)" stroke="var(--hero-line)" />
      <path d="m108 353 12 77m391-56-8 46M183 401l-5 51" stroke="var(--hero-ink)" strokeWidth="9" />
      <path d="m108 353 12 77m391-56-8 46M183 401l-5 51" stroke="var(--hero-desk-edge)" strokeWidth="6" />
      <g data-task-pile>
        {tasks.map((task, index) => (
          <TaskPaper key={task} task={task} index={index} />
        ))}
      </g>
      <Envelope promotion={promotion} />
      <g opacity=".6">
        <path d="m91 304 55-4 8 5-55 5Z" fill="var(--hero-ink)" />
        <path d="m146 300 9 4-1 1-9 1" fill="var(--hero-envelope)" />
      </g>
    </svg>
  );
}
