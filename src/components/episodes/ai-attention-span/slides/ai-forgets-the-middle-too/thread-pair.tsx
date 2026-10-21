import {
  callBubbleClass,
  type CallLight,
  type CallWho,
} from '@/components/slide-shared/call-transcript/call-transcript';
import { Sparkle } from '@/components/slide-shared/human-in-the-loop/glyphs';
import type { TargetProps } from '@/lib/context-link.pure';
import type { ReactNode } from 'react';

/** The three bands both threads share, in reading order. */
export type Band = 'start' | 'middle' | 'end';

const BANDS: readonly Band[] = ['start', 'middle', 'end'];

export interface BandCopy {
  readonly pill: string;
  /** The pill's Context marker, or `null` where the band has none. */
  readonly marker: ReactNode;
  /** The note target the pill carries, where a note explains the band. */
  readonly target?: TargetProps;
  /** The sister thread's lines in this band, in order. */
  readonly left: readonly ReactNode[];
  /** The AI thread's lines in this band, in order. */
  readonly right: readonly ReactNode[];
}

export interface ThreadPairCopy {
  readonly sister: { readonly name: string; readonly meta: string };
  readonly ai: { readonly name: string; readonly meta: string };
  readonly bands: Readonly<Record<Band, BandCopy>>;
  readonly bottomLine: ReactNode;
}

interface Line {
  readonly who: CallWho;
  readonly light: CallLight;
}

const line = (who: CallWho, light: CallLight): Line => ({ who, light });

/** Who speaks each line of each band and how it reads at rest: the sister thread left, the summer-party chat right. */
const THREADS: Readonly<Record<Band, { readonly left: readonly Line[]; readonly right: readonly Line[] }>> = {
  start: {
    left: [line('you', 'lit'), line('sister', 'lit')],
    right: [line('you', 'lit'), line('ai', 'lit')],
  },
  middle: {
    left: [line('you', 'faded'), line('sister', 'faded'), line('you', 'faded')],
    right: [line('you', 'faded'), line('ai', 'faded'), line('tool', 'faded')],
  },
  end: {
    left: [line('sister', 'lit'), line('you', 'lit')],
    right: [line('you', 'lit'), line('ai', 'lit')],
  },
};

function ToolIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-3 shrink-0" aria-hidden="true">
      <path
        d="M4 2l4 4-4 4"
        className="fill-none stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** One line of a thread in the cornerstone's Simple-view look. */
function ThreadLine({ spec, children }: { spec: Line; children: ReactNode }) {
  return (
    <li data-who={spec.who} data-light={spec.light} className={callBubbleClass(spec.who, spec.light)}>
      {spec.who === 'tool' ? <ToolIcon /> : null}
      {spec.who === 'tool' ? <span>{children}</span> : children}
    </li>
  );
}

function Thread({
  side,
  specs,
  texts,
}: {
  side: 'sister' | 'ai';
  specs: readonly Line[];
  texts: readonly ReactNode[];
}) {
  return (
    <div data-side={side} className="col-span-6 flex flex-col gap-2 @xl:col-span-5">
      <ol className="flex flex-col gap-2">
        {specs.map((spec, i) => (
          <ThreadLine key={i} spec={spec}>
            {texts[i]}
          </ThreadLine>
        ))}
      </ol>
    </div>
  );
}

function Pill({ copy }: { copy: BandCopy }) {
  return (
    <div className="order-first col-span-12 flex items-center justify-center @xl:order-none @xl:col-span-2">
      <span
        {...copy.target}
        data-pill=""
        className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-caption font-semibold text-background"
      >
        {copy.pill}
        {copy.marker}
      </span>
    </div>
  );
}

function ThreadHead({ name, meta, icon }: { name: string; meta: string; icon: ReactNode }) {
  return (
    <div className="col-span-6 flex items-center gap-3 border-b border-border pb-3 @xl:col-span-5">
      {icon}
      <div className="flex min-w-0 flex-col">
        <span className="text-body font-semibold">{name}</span>
        <span className="text-caption text-muted-foreground">{meta}</span>
      </div>
    </div>
  );
}

function Heads({ copy }: { copy: ThreadPairCopy }) {
  const sister = (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-caption font-semibold"
    >
      {copy.sister.name.charAt(0)}
    </span>
  );
  const ai = (
    <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ai/20">
      <Sparkle className="size-4" />
    </span>
  );
  return (
    <div className="grid grid-cols-12 gap-x-4 @xl:gap-x-6">
      <ThreadHead name={copy.sister.name} meta={copy.sister.meta} icon={sister} />
      <div className="hidden @xl:col-span-2 @xl:block" />
      <ThreadHead name={copy.ai.name} meta={copy.ai.meta} icon={ai} />
    </div>
  );
}

function assertBands(copy: ThreadPairCopy) {
  for (const band of BANDS) {
    const { left, right } = copy.bands[band];
    if (left.length !== THREADS[band].left.length || right.length !== THREADS[band].right.length) {
      throw new Error(
        `The ${band} band needs ${THREADS[band].left.length} sister and ${THREADS[band].right.length} AI lines.`,
      );
    }
  }
}

/**
 * The sister thread and the summer-party chat side by side in one frame, aligned on three shared bands (Spec Option
 * 2a), so the same lighting visibly lands on both. Everything shows at rest and enters with the Slide; nothing steps in. Pointing at a line dims the others on both sides. Below a wide frame the pill sits above its two threads.
 */
export function ThreadPair({ copy }: { copy: ThreadPairCopy }) {
  assertBands(copy);
  return (
    <div className="flex flex-col gap-6">
      <div className="@container flex flex-col gap-6 rounded-3xl border border-border bg-card p-4 shadow-md @xl:p-6">
        <Heads copy={copy} />
        <div className="focus-group focus-group--dim-others flex flex-col gap-5">
          {BANDS.map((band) => (
            <div key={band} data-band={band} className="grid grid-cols-12 gap-x-4 gap-y-2 @xl:gap-x-6">
              <Thread side="sister" specs={THREADS[band].left} texts={copy.bands[band].left} />
              <Pill copy={copy.bands[band]} />
              <Thread side="ai" specs={THREADS[band].right} texts={copy.bands[band].right} />
            </div>
          ))}
        </div>
      </div>
      <p data-bottom-line="" className="text-subheading font-semibold">
        {copy.bottomLine}
      </p>
    </div>
  );
}
