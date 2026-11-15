import { BoardNote } from '@/episodes/components/slide-shared/party-board/sticky-note';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/** A failure from the board, now fixed: what it was and what fixes it. */
export interface Fixed {
  readonly slug: string;
  readonly was: string;
  readonly now: string;
}

/** The arrow from a skill to the failures it fixed: across where they sit side by side, down where they stack. */
function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="mx-auto size-6 rotate-90 @md:col-span-1 @md:rotate-0" aria-hidden="true">
      <path
        d="M2 12 H20 M14 6 L20 12 L14 18"
        className="fill-none stroke-foreground"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The failures a skill fixed, each the board's same note now marked fixed. */
function FixedList({ fixed, label }: { fixed: readonly Fixed[]; label: string }) {
  return (
    <div className="flex flex-col gap-2 @md:col-span-5">
      {fixed.map((each) => (
        <BoardNote
          key={each.slug}
          kicker={each.was}
          text={each.now}
          mark="fixed"
          markLabel={label}
          className="p-2 [&_[data-note-text]]:text-caption"
        />
      ))}
    </div>
  );
}

/**
 * One skill to build in each person, as a note pointing at the failures it would have fixed, each the board's same
 * note now marked fixed.
 */
export function SkillRow(props: {
  slug: string;
  skill: ReactNode;
  fixed: readonly Fixed[];
  fixedLabel: string;
  tilt: 'left' | 'right';
}) {
  return (
    <li data-skill={props.slug} className="focus-group__item grid grid-cols-1 items-center gap-3 @md:grid-cols-12">
      <p
        data-skill-text
        className={cn(
          'rounded-md bg-card p-3 text-body font-semibold shadow-md @md:col-span-6',
          props.tilt === 'left' ? '-rotate-1' : 'rotate-1',
        )}
      >
        {props.skill}
      </p>
      <Arrow />
      <FixedList fixed={props.fixed} label={props.fixedLabel} />
    </li>
  );
}
