import { PickSwitch } from '@/episodes/components/slide-shared/agent-setup-step/pick-switch.client';
import { AGENTS, casesOf, DEFAULT_AGENT } from '@/episodes/components/slide-shared/agent-setup-step/picks.pure';
import {
  signInOptions,
  type SignInOption,
} from '@/episodes/components/slide-shared/agent-setup-step/sign-in-options.pure';
import type { ReactNode } from 'react';

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-primary px-2 py-0.5 text-caption font-semibold text-primary-foreground">
      {children}
    </span>
  );
}

interface OptionProps {
  readonly option: SignInOption;
  readonly number: number;
  readonly badge: string;
  readonly text: string;
}

function Option({ option, number, badge, text }: OptionProps) {
  return (
    <li
      data-option={option.id}
      data-label={option.label}
      data-recommended={option.recommended ? '' : undefined}
      className="flex flex-wrap items-baseline gap-x-2"
    >
      <span className="text-muted-foreground">{number}.</span>
      {option.label === undefined ? null : (
        <code className="font-mono font-semibold text-foreground">{option.label}</code>
      )}
      {option.recommended ? <Badge>{badge}</Badge> : null}
      <span className="min-w-0 basis-full pl-5 text-muted-foreground">{text}</span>
    </li>
  );
}

function After({ lines }: { lines: readonly ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 text-body" data-after="">
      {lines.map((line, index) => (
        <li key={index}>{line}</li>
      ))}
    </ul>
  );
}

interface PickOptionsProps {
  readonly title: string;
  readonly badge: string;
  readonly describe: (agent: string, option: string) => string;
  /** What follows the sign-in, per AI agent id. */
  readonly after: Readonly<Record<string, readonly ReactNode[]>>;
}

/** "Which option do I pick?": the agent's real sign-in options in the vendor's order, one marked, then what follows. */
export function PickOptions({ title, badge, describe, after }: PickOptionsProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4" data-pick="">
      <p className="text-body font-semibold">{title}</p>
      <PickSwitch
        name="agent"
        fallback={DEFAULT_AGENT}
        cases={casesOf(AGENTS, (agent) => (
          <div className="flex flex-col gap-3">
            <ol className="flex flex-col gap-2 text-body">
              {signInOptions(agent.id).map((option, index) => (
                <Option
                  key={option.id}
                  option={option}
                  number={index + 1}
                  badge={badge}
                  text={describe(agent.id, option.id)}
                />
              ))}
            </ol>
            <After lines={after[agent.id] ?? []} />
          </div>
        ))}
      />
    </div>
  );
}
