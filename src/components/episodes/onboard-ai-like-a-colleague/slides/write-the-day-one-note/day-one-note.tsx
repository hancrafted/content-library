/** One line of the note: its label, and the `data-target` a Speaker note names, if any. */
interface NoteLine {
  slug: string;
  text: string;
  'data-target'?: string;
}

/*
 * A server part of this Slide: a blank note with four short lines to fill in,
 * each a label and an empty rule to write on, and a still caret at the start
 * of the first blank. It takes plain props, never the kit; the Slide reads its
 * strings with `t` and passes them in, plus the `data-target`s its notes name.
 * No numbers, tints or icons, and no motion (Han's decision for this Episode).
 */
export function DayOneNote({ label, lines, ...props }: { label: string; lines: NoteLine[]; 'data-target'?: string }) {
  return (
    <figure {...props} aria-label={label} className="w-full max-w-xl rounded-lg border border-border bg-card p-8">
      <ul className="list-none space-y-6">
        {lines.map(({ slug, text, ...line }, index) => (
          <li key={slug} {...line} data-line={slug} className="flex items-end gap-4">
            <span className="text-body text-muted-foreground">{text}</span>
            <span className="flex-1 border-b border-border">
              {index === 0 && <span aria-hidden="true" className="inline-block h-[1.2em] w-0.5 bg-foreground" />}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
