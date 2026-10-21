import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/*
 * The phone-call transcript Slides 1, 2 and 6 draw, in the cornerstone's Simple-view bubble look: your message grey on
 * the right, the sister's in a bordered card on the left, the AI's reply as plain text, tool work as a grey line. A
 * static server part: a Slide hands it its lines and label and owns every word. Each bubble carries `data-light` and
 * `data-index`, so a Slide's own step leaf and CSS can fade or light bubbles without a second markup.
 */

/** Who speaks a line. */
export type CallWho = 'you' | 'sister' | 'ai' | 'tool';

/** How a line reads at rest: lit, faded into the middle, or the standout that survives. */
export type CallLight = 'lit' | 'faded' | 'standout';

/** `md` for a transcript that is the Scene, `sm` for one beside another picture. */
export type CallSize = 'md' | 'sm';

export interface CallLine {
  readonly who: CallWho;
  readonly text: string;
  readonly light: CallLight;
}

const WHO: Readonly<Record<CallWho, string>> = {
  you: 'self-end rounded-2xl rounded-br-md bg-foreground/10 text-foreground',
  sister: 'self-start rounded-2xl rounded-bl-md border border-border bg-card text-foreground shadow-sm',
  ai: 'self-stretch text-body text-foreground',
  tool: 'flex items-center gap-2 self-stretch text-caption text-muted-foreground',
};

const SIZE: Readonly<Record<CallSize, string>> = {
  md: 'max-w-md px-4 py-2 text-body',
  sm: 'max-w-xs px-3 py-1.5 text-caption',
};

const LIGHT: Readonly<Record<CallLight, string>> = {
  lit: '',
  faded: 'opacity-40',
  standout: 'shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background',
};

/** Fills fade with their bubble: a faded message of yours sits on a lighter grey. */
const fadedFill = (who: CallWho, light: CallLight) =>
  light === 'faded' && who === 'you' ? 'bg-foreground/5 text-muted-foreground' : '';

/** The classes of one bubble, for a Slide that places a bubble outside a transcript. */
export function callBubbleClass(who: CallWho, light: CallLight, size: CallSize = 'md'): string {
  const plain = who === 'ai' || who === 'tool';
  return cn(
    'focus-group__item transition-opacity duration-300 motion-reduce:transition-none',
    WHO[who],
    plain ? 'px-2 py-1' : SIZE[size],
    plain && size === 'sm' ? 'text-caption' : null,
    LIGHT[light],
    fadedFill(who, light),
  );
}

interface BubbleProps {
  readonly who: CallWho;
  readonly light: CallLight;
  readonly size?: CallSize;
  readonly index?: number;
  readonly children: ReactNode;
}

/** One line of the call, as a list item of a transcript. */
export function CallBubble({ who, light, size = 'md', index, children }: BubbleProps) {
  return (
    <li className={callBubbleClass(who, light, size)} data-who={who} data-light={light} data-index={index}>
      {children}
    </li>
  );
}

interface TranscriptProps {
  readonly lines: readonly CallLine[];
  /** The transcript's accessible name, for example "Phone call with your sister". */
  readonly label: string;
  readonly size?: CallSize;
  readonly className?: string;
}

/** The call as an ordered list; pointing at one bubble dims the rest. */
export function CallTranscript({ lines, label, size = 'md', className }: TranscriptProps) {
  return (
    <ol
      aria-label={label}
      className={cn('focus-group--dim-others flex flex-col', size === 'md' ? 'gap-3' : 'gap-1.5', className)}
    >
      {lines.map((line, i) => (
        <CallBubble key={i} who={line.who} light={line.light} size={size} index={i}>
          {line.text}
        </CallBubble>
      ))}
    </ol>
  );
}
