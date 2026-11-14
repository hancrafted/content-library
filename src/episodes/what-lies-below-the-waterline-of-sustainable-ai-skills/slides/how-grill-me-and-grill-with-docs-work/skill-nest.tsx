import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { cn } from '@/shared/lib/utils';
import styles from './slide.module.css';

export interface SkillSheetProps {
  readonly kind: string;
  readonly path: string;
  /** Plain steps in the Chat app view; the file's own lines, highlighted, in the Coding agent view. */
  readonly steps: readonly { readonly chat: string; readonly coding: string }[];
}

export interface SkillNestProps {
  readonly outer: { readonly path: string; readonly name: string; readonly desc: string; readonly coding: string };
  readonly stays: string;
  readonly inner: readonly SkillSheetProps[];
}

/** One skill grill-with-docs runs: its steps as tiles, or its lines as the file writes them. */
function SkillSheet({ kind, path, steps }: SkillSheetProps) {
  return (
    <section data-skill-sheet={path} className={cn(styles.paper, 'flex flex-col gap-2 rounded-md p-3 shadow-md')}>
      <h5 className="border-b border-border pb-1 text-caption font-semibold text-muted-foreground">
        <InView view="chat">{kind}</InView>
        <InView view="coding" className="font-mono">
          {path}
        </InView>
      </h5>
      <ol className="grid gap-2 @xl:grid-cols-2">
        {steps.map(({ chat, coding }) => (
          <li key={chat} className={cn(styles.step, 'rounded-sm px-2 py-1 text-caption')}>
            <InView view="chat">{chat}</InView>
            <InView view="coding" className={cn(styles.highlight, 'font-mono break-words')}>
              {coding}
            </InView>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * The one skill on top (Option 19b): grill-with-docs as one sheet holding the two skills it runs, the grilling
 * interview and domain-modeling, under the dark "Stays the same every run" label. Containment shows that a skill runs
 * other skills.
 */
export function SkillNest({ outer, stays, inner }: SkillNestProps) {
  return (
    <section data-skill-nest className={cn(styles.paper, 'relative flex flex-col gap-3 rounded-md p-4 shadow-lg')}>
      <p className="absolute -top-3 right-3 rounded-full bg-foreground px-3 text-caption font-semibold text-background">
        {stays}
      </p>
      <div className="flex flex-col gap-0.5 pr-2">
        <InView view="chat" as="p" className="text-body font-semibold">
          {outer.name}
        </InView>
        <InView view="chat" as="p" className="text-caption text-muted-foreground">
          {outer.desc}
        </InView>
        <InView view="coding" as="p" className="font-mono text-body font-semibold break-words">
          {outer.path}
        </InView>
        <InView view="coding" as="p" className="font-mono text-caption break-words text-muted-foreground">
          {outer.coding}
        </InView>
      </div>
      <div className="grid gap-3 @3xl:grid-cols-2">
        {inner.map((sheet) => (
          <SkillSheet key={sheet.path} {...sheet} />
        ))}
      </div>
    </section>
  );
}
