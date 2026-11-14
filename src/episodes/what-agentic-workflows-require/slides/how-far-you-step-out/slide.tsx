import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { AgentBadge, Arrow, Board, Tick } from '@/episodes/components/slide-shared/party-board/board';
import { Note } from '@/episodes/components/slide-shared/party-board/note';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { OversightPills } from './oversight-pills';
import { Person } from './person';

/** The middle of the seam, where the person stands over its check. */
const MID = 180;

// The section slide of "How far you step out", echoing the Hero motif (picked Title-slide Option 0b): a person on the
// loop over the seam, checking what crosses it, under the oversight pills with on selected.
export const howFarYouStepOut = slide({
  slug: 'how-far-you-step-out',
  messages: { en, de },
  segments: [{ slug: 'open-question' }],
  content: ({ t }) => (
    <SlideFrame>
      <Board label={t('board')}>
        <OversightPills
          cx={MID}
          y={12}
          selected="on"
          labels={{ in: t('pills.in'), on: t('pills.on'), out: t('pills.out') }}
        />
        <Person cx={MID} y={78} />
        <line x1={MID} y1={80} x2={MID} y2={108} className="stroke-human" strokeWidth={1.5} strokeDasharray="3 3" />
        <Note
          box={{ x: 8, y: 96, width: 124, height: 46 }}
          tilt={-1}
          lines={[t('seam.from')]}
          badge={<AgentBadge cx={12} cy={137} />}
        />
        <Arrow from={136} to={224} y={119} tone="primary" />
        <Tick cx={MID} cy={119} tone="primary" />
        <Note box={{ x: 228, y: 96, width: 124, height: 46 }} tilt={1} look="external" lines={[t('seam.to')]} />
        <text x={MID} y={168} textAnchor="middle" className="fill-muted-foreground text-caption">
          {t('footer')}
        </text>
      </Board>
    </SlideFrame>
  ),
});
