import { externalHref } from '@/lib/external-link.pure';
import type { ReactNode } from 'react';
import type { Handoff } from './handoff.pure';
import type { UiWords } from './human-in-the-loop.types';
import { OutputView } from './outputs/output-dispatch';
import type { OutputWords } from './outputs/output-words';
import type { ModalSection } from './workflow-view.pure';

const SECTION_LABEL: Record<ModalSection['kind'], keyof UiWords> = {
  does: 'sectionDoes',
  in: 'sectionIn',
  out: 'sectionOut',
  criteria: 'sectionCriteria',
  skills: 'sectionSkills',
  fullPrompt: 'sectionFullPrompt',
  example: 'sectionExample',
};

type Of<K extends ModalSection['kind']> = Extract<ModalSection, { kind: K }>;

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-1 list-disc pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Links({ section }: { section: Of<'skills'> }) {
  return (
    <ul className="mt-1 flex flex-wrap gap-2">
      {section.links.map((link) => (
        <li key={link.href}>
          <a className="underline" href={externalHref(link.href)} target="_blank" rel="noopener noreferrer">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

interface Ticking {
  readonly ticked: readonly string[];
  readonly onTick: (ticketId: string) => void;
  readonly outputWords: OutputWords;
}

function Example({ examples, ticking }: { examples: readonly Handoff[]; ticking: Ticking }) {
  return (
    <div className="mt-1 flex flex-col gap-2">
      {examples.map((handoff, at) => (
        <div key={at}>
          <OutputView handoff={handoff} ticked={ticking.ticked} onTick={ticking.onTick} words={ticking.outputWords} />
        </div>
      ))}
    </div>
  );
}

function bodyOf(section: ModalSection, examples: readonly Handoff[], ticking: Ticking): ReactNode {
  if (section.kind === 'does') return <p className="mt-1">{section.text}</p>;
  if (section.kind === 'skills') return <Links section={section} />;
  if (section.kind === 'example') return <Example examples={examples} ticking={ticking} />;
  if (section.kind === 'fullPrompt')
    return <pre className="mt-1 rounded-md bg-muted p-2 text-caption whitespace-pre-wrap">{section.text}</pre>;
  return <List items={section.items} />;
}

interface ModalBodyProps extends Ticking {
  readonly sections: readonly ModalSection[];
  readonly examples: readonly Handoff[];
  readonly words: UiWords;
}

/** The modal body in the order the view gives: what it does, in, out, criteria, skills, full prompt, example. */
export function ModalBody({ sections, examples, words, ...ticking }: ModalBodyProps) {
  return (
    <div className="mt-2 flex min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain pr-2">
      {sections.map((section) => (
        <section key={section.kind}>
          <h3 className="text-caption font-medium text-muted-foreground">{words[SECTION_LABEL[section.kind]]}</h3>
          {bodyOf(section, examples, ticking)}
        </section>
      ))}
    </div>
  );
}
