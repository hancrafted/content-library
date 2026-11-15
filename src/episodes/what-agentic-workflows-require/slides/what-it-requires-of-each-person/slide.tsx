import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Arrow, Board, Tick } from '@/episodes/components/slide-shared/party-board/board';
import { Note } from '@/episodes/components/slide-shared/party-board/note';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** Where the contract card's terms and their values start, in board units. */
const TERM_X = 22;
const VALUE_X = 128;

// The section slide of "What it requires of each person", echoing the Hero motif (picked Title-slide Option 0b): the
// seam's contract card filled with the definition of vegetarian and ticked, the seam now holding.
export const whatItRequiresOfEachPerson = slide({
  slug: 'what-it-requires-of-each-person',
  messages: { en, de },
  segments: [{ slug: 'skills-behind-the-failures' }],
  content: ({ t }) => {
    const rows = [
      { term: t('contract.terms.receives'), value: t('contract.receives'), y: 80 },
      { term: t('contract.terms.delivers'), value: t('contract.delivers'), y: 124 },
      { term: t('contract.terms.checkedBy'), value: t('contract.checkedBy'), y: 152 },
    ];
    return (
      <SlideFrame>
        <Board label={t('board')}>
          <Note box={{ x: 8, y: 10, width: 124, height: 34 }} tilt={-1} lines={[t('seam.from')]} />
          <Arrow from={136} to={224} y={27} tone="primary" />
          <Note box={{ x: 228, y: 10, width: 124, height: 34 }} tilt={1} look="external" lines={[t('seam.to')]} />
          <rect x={10} y={56} width={340} height={116} rx={6} className="fill-card stroke-primary" strokeWidth={2} />
          {rows.map(({ term, value, y }) => (
            <g key={term}>
              <text data-contract-term x={TERM_X} y={y} className="fill-foreground text-caption font-semibold">
                {term}
              </text>
              <text x={VALUE_X} y={y} className="fill-muted-foreground text-caption">
                {value}
              </text>
            </g>
          ))}
          <text data-definition x={VALUE_X} y={98} className="fill-foreground text-caption font-semibold">
            {t('contract.definition')}
          </text>
          <Tick cx={330} cy={148} tone="success" />
        </Board>
      </SlideFrame>
    );
  },
});
