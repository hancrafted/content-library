import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { DayOneNote } from './day-one-note';
import de from './i18n/de.json';
import en from './i18n/en.json';

const CLAUDE_CODE_BEST_PRACTICES = {
  slug: 'claude-code-best-practices',
  url: 'https://code.claude.com/docs/en/best-practices',
} as const;

/*
 * A Scene on the basic-page parts, carrying the Brief's Actionable: the title,
 * a caption, and in the prose slot a blank day-one note with four lines to
 * fill in, the context, the tools, the brief and the check. `BasicPageSlide`
 * puts its prose in a `<p>`, which cannot hold the note. Built without motion
 * (Han's decision for this Episode).
 */
export const writeTheDayOneNote = slide({
  slug: 'write-the-day-one-note',
  messages: { en, de },
  notes: [
    { slug: 'why-check-is-on-the-list', target: 'check', sources: [CLAUDE_CODE_BEST_PRACTICES] },
    {
      slug: 'a-short-checklist-can-cut-errors',
      target: 'note',
      sources: [{ slug: 'surgical-safety-checklist', url: 'https://pubmed.ncbi.nlm.nih.gov/19144931/' }],
    },
    { slug: 'keep-the-note-short', target: 'caption', sources: [CLAUDE_CODE_BEST_PRACTICES] },
  ],
  segments: [{ slug: 'next-time' }, { slug: 'jot-it-down' }, { slug: 'four-lines' }, { slug: 'two-minutes' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div className="mt-auto pt-10">
        <DayOneNote
          {...target('note')}
          label={t('note.label')}
          lines={[
            { slug: 'context', text: t('note.lines.context') },
            { slug: 'tools', text: t('note.lines.tools') },
            { slug: 'brief', text: t('note.lines.brief') },
            { slug: 'check', text: t('note.lines.check'), ...target('check') },
          ]}
        />
      </div>
    </SlideFrame>
  ),
});
