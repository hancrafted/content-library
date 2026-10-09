import { PaperTray, PaperTrayFront, PromotionOffice } from '@/components/landing/promotion-office';
import { PAPER_CAPACITY, PAPER_PILE_ORIGIN } from '@/lib/paper-pile.pure';

interface PromotionDeskProps {
  promotion: string;
  tasks: string[];
}

function TaskLabel({ task }: { task: string }) {
  return (
    <g transform="matrix(1 0 .78 1 25 14)">
      <rect width="4" height="53" rx="1" fill="var(--hero-brass)" />
      <text x="18" y="24" fill="var(--hero-paper-ink)" fontSize="20" fontFamily="Arial, sans-serif" fontWeight="600">
        {task}
      </text>
      <path d="M18 39h146m-146 11h103" stroke="var(--hero-paper-rule)" strokeWidth="2" />
      <path d="M205 8v29m-7-29v29" stroke="var(--hero-paper-rule)" />
    </g>
  );
}

function TaskPaper({ task, index }: { task: string; index: number }) {
  return (
    <g transform={`translate(${(index % 3) - 1} ${-index * PAPER_PILE_ORIGIN.step})`}>
      <g data-task-paper opacity="0">
        <path d="M0 0h267l95 115H90Z" fill="var(--hero-paper-edge)" transform="translate(0 4)" />
        <path d="M0 0h267l95 115H90Z" fill="url(#hero-paper)" stroke="var(--hero-paper-rule)" strokeWidth=".6" />
        <TaskLabel task={task} />
        <path
          data-paper-check
          d="m126 54 36 28 70-57"
          stroke="var(--hero-check)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0"
        />
      </g>
    </g>
  );
}

function EnvelopeDetails({ promotion }: { promotion: string }) {
  return (
    <>
      <text
        x="139"
        y="140"
        textAnchor="middle"
        fill="var(--hero-envelope-ink)"
        fontSize="22"
        fontFamily="Georgia, serif"
        letterSpacing=".8"
      >
        {promotion}
      </text>
      <g data-envelope-seal opacity="0">
        <circle cx="139" cy="81" r="16" fill="var(--hero-brass)" />
        <circle cx="139" cy="81" r="12" stroke="var(--hero-envelope)" strokeWidth=".6" />
        <path d="M134 75v12m10-12v12m-10-6h10" stroke="var(--hero-envelope)" strokeWidth="1.3" />
      </g>
    </>
  );
}

function EnvelopeStock() {
  return (
    <>
      <path
        data-envelope-shadow
        d="M-10 17h293v160H-10Z"
        fill="var(--hero-shadow)"
        opacity=".2"
        filter="url(#hero-soft-shadow)"
      />
      <path data-envelope-open d="M0 0 139-89 278 0Z" fill="var(--hero-envelope-inner)" />
      <rect width="278" height="167" rx="5" fill="url(#hero-envelope-stock)" stroke="var(--hero-envelope-rule)" />
      <rect data-envelope-red width="278" height="167" rx="5" fill="var(--hero-envelope-angry)" opacity="0" />
      <path d="M2 2h274M2 165h274" stroke="var(--hero-paper)" strokeOpacity=".55" />
      <path
        d="m0 167 110-93q29-18 58 0l110 93"
        fill="var(--hero-envelope)"
        fillOpacity=".22"
        stroke="var(--hero-envelope-rule)"
      />
      <path
        data-envelope-flap
        d="m0 0 139 88L278 0Z"
        fill="var(--hero-envelope-inner)"
        stroke="var(--hero-envelope-rule)"
        opacity="0"
      />
    </>
  );
}

function Envelope({ promotion }: { promotion: string }) {
  return (
    <g transform="translate(755 680)">
      <g data-envelope>
        <EnvelopeStock />
        <path
          data-envelope-tear
          d="m5 0 21-3 17 5 14-3 17 2 19-4 18 3 17-4 20 4 22-3 17 4 18-4 16 3 16-4 20 4"
          stroke="var(--hero-paper)"
          strokeWidth="2"
        />
        <EnvelopeDetails promotion={promotion} />
        <g data-envelope-face opacity="0" stroke="var(--hero-envelope-ink)" strokeWidth="5" strokeLinecap="round">
          <path d="m96 47 25 11m36 0 25-11m-73 24v7m61-7v7m-48 28q17-17 34 0" />
        </g>
      </g>
    </g>
  );
}

export function PromotionDesk({ promotion, tasks }: PromotionDeskProps) {
  return (
    <svg data-office-scene viewBox="0 0 1600 900" fill="none" aria-hidden="true">
      <PromotionOffice />
      <defs>
        <linearGradient id="hero-envelope-stock" x2=".35" y2="1">
          <stop stopColor="var(--hero-paper)" />
          <stop offset=".4" stopColor="var(--hero-envelope)" />
          <stop offset="1" stopColor="var(--hero-envelope-inner)" />
        </linearGradient>
        <clipPath id="hero-far-edge">
          <path d="M0-900h1600V528H0Z" />
        </clipPath>
      </defs>
      <g data-overflow-papers clipPath="url(#hero-far-edge)" />
      <PaperTray x={PAPER_PILE_ORIGIN.x} y={PAPER_PILE_ORIGIN.y + 15} />
      <g data-task-pile transform={`translate(${PAPER_PILE_ORIGIN.x} ${PAPER_PILE_ORIGIN.y})`}>
        {Array.from({ length: PAPER_CAPACITY }, (_, index) => (
          <TaskPaper key={index} task={tasks[index % tasks.length]} index={index} />
        ))}
      </g>
      <PaperTrayFront x={PAPER_PILE_ORIGIN.x} y={PAPER_PILE_ORIGIN.y + 15} />
      <g data-completed-papers />
      <Envelope promotion={promotion} />
    </svg>
  );
}
