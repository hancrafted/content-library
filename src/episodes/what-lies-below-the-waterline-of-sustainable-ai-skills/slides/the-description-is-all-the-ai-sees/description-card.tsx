import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { cn } from '@/shared/lib/utils';
import styles from './slide.module.css';

interface SkillFile {
  readonly path: string;
  readonly name: string;
  readonly description: string;
}

export interface DescriptionCardProps {
  readonly kind: 'vague' | 'clear';
  readonly label: string;
  readonly tag: string;
  /** The description in the quotation marks of its locale. */
  readonly text: string;
  /** The same description as the front matter of the skill's file, for the Coding agent view. */
  readonly coding: SkillFile;
}

/** The description as the front matter of the skill's file: primary for the clear one, dark for the vague one. */
function FrontMatter({ file, clear }: { readonly file: SkillFile; readonly clear: boolean }) {
  return (
    <InView view="coding" as="div" className="flex flex-col gap-1">
      <span className="font-mono text-caption text-muted-foreground">{file.path}</span>
      <code
        translate="no"
        className={cn(
          'block rounded-md px-3 py-2 font-mono text-caption whitespace-pre-wrap',
          clear ? 'bg-primary text-primary-foreground' : 'bg-foreground text-background',
        )}
      >
        {`---\nname: ${file.name}\ndescription: ${file.description}\n---`}
      </code>
    </InView>
  );
}

/**
 * One of the two descriptions for the same skill: the vague one dashed and muted, staying shut; the clear one ringed in
 * primary once today's task lights it. Hover raises the card and dims its neighbour.
 */
export function DescriptionCard({ kind, label, tag, text, coding }: DescriptionCardProps) {
  const clear = kind === 'clear';
  return (
    <article
      data-description-card={kind}
      className={cn(
        'focus-group__item card-hover card-hover--raise flex flex-col gap-3 rounded-xl bg-card p-5 text-card-foreground',
        clear ? cn('shadow-md', styles.ringed) : 'border-2 border-dashed border-border',
      )}
    >
      <p className="flex flex-wrap items-center justify-between gap-2 text-caption font-semibold text-muted-foreground">
        <span>{label}</span>
        <span className={cn(clear && 'rounded-full bg-primary px-2.5 py-0.5 text-primary-foreground')}>{tag}</span>
      </p>
      <InView view="chat" as="p" className={cn('text-body font-semibold', !clear && 'text-muted-foreground')}>
        {text}
      </InView>
      <FrontMatter file={coding} clear={clear} />
    </article>
  );
}
