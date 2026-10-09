import type { TargetProps } from '@/lib/context-link.pure';
import Image from 'next/image';
import type { ReactElement } from 'react';

function FastCard(): ReactElement {
  return (
    <div className="s21-card rounded-box border border-success/30 bg-success/5 p-5">
      <span className="w-fit rounded-md bg-success/10 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-widest text-success">
        strength (?)
      </span>
      <h4 className="mt-2 font-display text-lg font-semibold">Fast &amp; well-read</h4>
      <p className="text-sm leading-relaxed text-base-content/60">
        Knows about everything you ask them, and can produce results fast without breaks.
      </p>
      <span aria-hidden="true" className="s21-shimmer text-success" />
      <span aria-hidden="true" className="s21-motif s21-motif--zip text-success">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M13 2 3 14h7l-1 8 11-12h-7z" />
        </svg>
      </span>
    </div>
  );
}

function AcceptsCard(): ReactElement {
  return (
    <div className="s21-card rounded-box border border-success/30 bg-success/5 p-5">
      <span className="w-fit rounded-md bg-success/10 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-widest text-success">
        strength (?)
      </span>
      <h4 className="mt-2 font-display text-lg font-semibold">Accepts any task</h4>
      <p className="text-sm leading-relaxed text-base-content/60">
        No task too big or too niche — it will take a swing at whatever you hand it.
      </p>
      <span aria-hidden="true" className="s21-motif s21-motif--check text-success">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" />
          <path
            className="s21-tick"
            d="M7 12.5 10.5 16 17 8.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

function TirelessCard(): ReactElement {
  return (
    <div className="s21-card rounded-box border border-success/30 bg-success/5 p-5">
      <span className="w-fit rounded-md bg-success/10 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-widest text-success">
        strength (?)
      </span>
      <h4 className="mt-2 font-display text-lg font-semibold">Tireless</h4>
      <p className="text-sm leading-relaxed text-base-content/60">Never stops, never sleeps, unless you stop paying.</p>
      <span aria-hidden="true" className="s21-motif s21-motif--loop text-success">
        <svg viewBox="0 0 24 12" fill="none" className="h-4 w-7">
          <path
            className="s21-inf"
            d="M2 6C2 1.5 9 1.5 12 6C15 10.5 22 10.5 22 6C22 1.5 15 1.5 12 6C9 10.5 2 10.5 2 6Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </div>
  );
}

function StrengthCards(): ReactElement {
  return (
    <div className="grid gap-3">
      <FastCard />
      <AcceptsCard />
      <TirelessCard />
    </div>
  );
}

function BillSvg(): ReactElement {
  return (
    <svg viewBox="0 0 28 18" fill="none" className="h-3.5 w-6">
      <rect x="1" y="1" width="26" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="14" y1="4.5" x2="14" y2="13.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function NoqCard(): ReactElement {
  return (
    <div className="s21-card rounded-box border border-error/30 bg-error/5 p-5">
      <span className="w-fit rounded-md bg-error/10 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-widest text-error">
        flaw
      </span>
      <h4 className="mt-2 font-display text-lg font-semibold">Never asks questions</h4>
      <p className="text-sm leading-relaxed text-base-content/60">
        Takes tasks literally, fills gaps with assumptions, never pushes back.
      </p>
      <span aria-hidden="true" className="s21-motif s21-motif--noq font-mono text-xl text-error">
        ?<span className="s21-slash" />
      </span>
    </div>
  );
}

function BillsCard(): ReactElement {
  return (
    <div className="s21-card rounded-box border border-error/30 bg-error/5 p-5">
      <span className="w-fit rounded-md bg-error/10 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-widest text-error">
        flaw
      </span>
      <h4 className="mt-2 font-display text-lg font-semibold">Bills by the word</h4>
      <p className="text-sm leading-relaxed text-base-content/60">
        No flat day rate. Every prompt, tool call, and correction adds to the tab.
      </p>
      <span aria-hidden="true" className="s21-bills text-error">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <span key={i} className="s21-bill">
            <BillSvg />
          </span>
        ))}
      </span>
    </div>
  );
}

function MemCard(): ReactElement {
  return (
    <div className="s21-card rounded-box border border-error/30 bg-error/5 p-5">
      <span className="w-fit rounded-md bg-error/10 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-widest text-error">
        flaw
      </span>
      <h4 className="mt-2 font-display text-lg font-semibold">It remembers nothing.</h4>
      <p className="text-sm leading-relaxed text-base-content/60">
        Every new conversation starts from zero. Yesterday&rsquo;s work never happened.
      </p>
      <span aria-hidden="true" className="s21-motif s21-motif--mem font-mono text-xl font-bold text-error">
        0
      </span>
    </div>
  );
}

function FlawCards(): ReactElement {
  return (
    <div className="grid gap-3">
      <NoqCard />
      <BillsCard />
      <MemCard />
    </div>
  );
}

export function FreelancerCards(target: TargetProps): ReactElement {
  return (
    <div {...target} className="mt-12 grid items-center gap-6 lg:grid-cols-[1fr_13rem_1fr]">
      <StrengthCards />
      <div className="flex justify-center self-stretch">
        <Image
          src="/images/episodes/ai-token-economy/freelancer.webp"
          alt="Split contractor: capability vs cost"
          width={208}
          height={400}
          className="h-full max-h-[30rem] w-auto object-contain"
        />
      </div>
      <FlawCards />
    </div>
  );
}
