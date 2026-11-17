import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

export type CallWho = 'you' | 'sister' | 'ai' | 'tool';

export type CallLight = 'lit' | 'faded' | 'standout';

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

const fadedFill = (who: CallWho, light: CallLight) =>
  light === 'faded' && who === 'you' ? 'bg-foreground/5 text-muted-foreground' : '';

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

export function CallBubble({ who, light, size = 'md', index, children }: BubbleProps) {
  return (
    <li className={callBubbleClass(who, light, size)} data-who={who} data-light={light} data-index={index}>
      {children}
    </li>
  );
}

interface TranscriptProps {
  readonly lines: readonly CallLine[];
  readonly label: string;
  readonly size?: CallSize;
  readonly className?: string;
}

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
