import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import styles from './slide.module.css';

/** One line of a session: what you typed, or what the agent answered. */
export interface TerminalRow {
  readonly who: 'you' | 'agent';
  readonly text: string;
}

const Dots = () => (
  <>
    <span className="size-2 rounded-full bg-background/40" />
    <span className="size-2 rounded-full bg-background/40" />
  </>
);

/** A coding-agent session, Session 1 or 2: you ask, the agent asks the same question again, you answer. */
export function AgentTerminal({ title, rows }: { readonly title: string; readonly rows: readonly TerminalRow[] }) {
  return (
    <div
      data-terminal
      className="flex h-full flex-col overflow-hidden rounded-lg bg-foreground font-mono text-background shadow-md"
    >
      <p className="flex items-center gap-2 border-b border-background/20 px-3 py-2 text-caption font-semibold">
        <Dots />
        <span className="ml-1">{title}</span>
      </p>
      <div className="flex flex-col gap-2 p-3 text-caption">
        {rows.map(({ who, text }) => (
          <p key={text} data-who={who} className="flex gap-2">
            <span aria-hidden className={cn('shrink-0', who === 'agent' ? 'text-ai' : 'text-background/60')}>
              {who === 'agent' ? '●' : '>'}
            </span>
            <span className={who === 'agent' ? 'text-background/80' : undefined}>{text}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export interface SkillFileProps {
  readonly path: string;
  readonly badge: string;
  readonly name: string;
  readonly description: string;
  readonly body: readonly string[];
  readonly goodResult: string;
  readonly footer: ReactNode;
}

/** The file's front matter: its name and its description, between the dashes. */
function FrontMatter({ name, description }: { readonly name: string; readonly description: string }) {
  return (
    <>
      <p className="text-background/60">---</p>
      <p>
        <span className="text-background/60">name: </span>
        {name}
      </p>
      <p>
        <span className="text-background/60">description: </span>
        {description}
      </p>
      <p className="text-background/60">---</p>
    </>
  );
}

/** Session 3: the new file `SKILL.md`, its front matter and steps typing in line by line. */
export function SkillFile({ path, badge, name, description, body, goodResult, footer }: SkillFileProps) {
  const line = (index: number) => ({ '--line': index }) as CSSProperties;
  return (
    <div
      data-skill-file
      className="flex h-full flex-col overflow-hidden rounded-lg border-2 border-primary bg-foreground font-mono text-background shadow-md"
    >
      <p className="flex items-center gap-2 border-b border-background/20 px-3 py-2 text-caption font-semibold">
        <span className="min-w-0 break-all">{path}</span>
        <span className="ml-auto rounded-sm bg-background px-1.5 font-sans whitespace-nowrap text-foreground">
          {badge}
        </span>
      </p>
      <div className="flex flex-col gap-0.5 p-3 text-caption">
        <FrontMatter name={name} description={description} />
        {[...body.map((step, index) => `${index + 1}. ${step}`), goodResult].map((text, index) => (
          <p key={text} data-motion="fill" style={line(index)} className={cn(styles.line, 'text-background/80')}>
            {text}
          </p>
        ))}
      </div>
      <p className="mt-auto border-t border-background/20 px-3 py-2 font-sans text-caption text-background/80">
        {footer}
      </p>
    </div>
  );
}
