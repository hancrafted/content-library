import { PaperTray, PromotionOffice } from '@/components/landing/promotion-office';
import { PAPER_CAPACITY } from '@/lib/paper-pile.pure';

interface PromotionDeskProps {
  promotion: string;
  tasks: string[];
}

function TaskPaper({ task, index }: { task: string; index: number }) {
  return (
    <g transform={`translate(${(index % 3) - 1} ${-index * 7})`}>
      <g data-task-paper opacity="0">
        <path d="M0 0h267l95 115H90Z" fill="var(--hero-paper-edge)" transform="translate(0 4)" />
        <path d="M0 0h267l95 115H90Z" fill="url(#hero-paper)" stroke="var(--hero-paper-rule)" strokeWidth=".6" />
        <g transform="matrix(1 0 .78 1 25 14)">
          <rect width="4" height="53" rx="1" fill="var(--hero-brass)" />
          <text
            x="18"
            y="24"
            fill="var(--hero-paper-ink)"
            fontSize="20"
            fontFamily="Arial, sans-serif"
            fontWeight="600"
          >
            {task}
          </text>
          <path d="M18 39h146m-146 11h103" stroke="var(--hero-paper-rule)" strokeWidth="2" />
          <path d="M205 8v29m-7-29v29" stroke="var(--hero-paper-rule)" />
        </g>
      </g>
    </g>
  );
}

function EnvelopeDetails({ promotion }: { promotion: string }) {
  return (
    <>
      <text
        x="139"
        y="120"
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

function Envelope({ promotion }: { promotion: string }) {
  return (
    <g data-envelope>
      <g transform="translate(1275 528) rotate(-9 140 80)">
        <path d="M-10 17h293v160H-10Z" fill="var(--hero-shadow)" opacity=".2" filter="url(#hero-soft-shadow)" />
        <path data-envelope-open d="M0 0 139-89 278 0Z" fill="var(--hero-envelope-inner)" />
        <rect width="278" height="167" rx="3" fill="var(--hero-envelope)" stroke="var(--hero-envelope-rule)" />
        <path d="m0 167 106-99m172 99-106-99" stroke="var(--hero-envelope-rule)" />
        <path
          data-envelope-flap
          d="m0 0 139 88L278 0Z"
          fill="var(--hero-envelope-inner)"
          stroke="var(--hero-envelope-rule)"
          opacity="0"
        />
        <path
          data-envelope-tear
          d="m5 0 21-3 17 5 14-3 17 2 19-4 18 3 17-4 20 4 22-3 17 4 18-4 16 3 16-4 20 4"
          stroke="var(--hero-paper)"
          strokeWidth="2"
        />
        <EnvelopeDetails promotion={promotion} />
      </g>
    </g>
  );
}

export function PromotionDesk({ promotion, tasks }: PromotionDeskProps) {
  return (
    <svg data-office-scene viewBox="0 0 1600 900" fill="none" aria-hidden="true">
      <PromotionOffice />
      <g data-empty-tray>
        <PaperTray x={705} y={735} />
      </g>
      <PaperTray x={895} y={561} />
      <g data-task-pile transform="translate(895 546)">
        {Array.from({ length: PAPER_CAPACITY }, (_, index) => (
          <TaskPaper key={index} task={tasks[index % tasks.length]} index={index} />
        ))}
      </g>
      <Envelope promotion={promotion} />
    </svg>
  );
}
