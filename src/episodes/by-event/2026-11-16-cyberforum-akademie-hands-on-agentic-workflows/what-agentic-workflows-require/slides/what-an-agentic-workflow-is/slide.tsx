import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { AgentBadge, Arrow, Board } from '@/episodes/components/slide-shared/party-board/board';
import { Note } from '@/episodes/components/slide-shared/party-board/note';
import de from './i18n/de.json';
import en from './i18n/en.json';

const CARDS = [
  { key: 'activities', x: 8, width: 76, look: 'card' },
  { key: 'travel', x: 92, width: 64, look: 'card' },
  { key: 'food', x: 164, width: 84, look: 'outlined' },
  { key: 'venue', x: 256, width: 80, look: 'outlined' },
] as const;

export const whatAnAgenticWorkflowIs = slide({
  slug: 'what-an-agentic-workflow-is',
  messages: { en, de },
  segments: [{ slug: 'name-the-thing' }],
  content: ({ t }) => (
    <SlideFrame>
      <Board label={t('board')}>
        {CARDS.map(({ key, x, width, look }) => (
          <Note
            key={key}
            box={{ x, y: 12, width, height: 40 }}
            look={look}
            lines={t(`cards.${key}`).split('\n')}
            data={{ 'data-board-card': true }}
          />
        ))}
        <path
          d="M206 54 L70 88 M296 54 L290 88"
          className="fill-none stroke-primary"
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
        <Note
          box={{ x: 8, y: 90, width: 124, height: 42 }}
          tilt={-1}
          lines={[t('seam.from')]}
          badge={<AgentBadge cx={12} cy={128} />}
        />
        <Arrow from={136} to={224} y={111} tone="primary" />
        <text x={180} y={84} textAnchor="middle" className="fill-primary text-caption font-semibold">
          {t('seam.handoff')}
        </text>
        <Note box={{ x: 228, y: 90, width: 124, height: 42 }} tilt={1} look="external" lines={[t('seam.to')]} />
        <path d="M136 138 V146 H224 V138" className="fill-none stroke-foreground" strokeWidth={1.5} />
        <text
          data-seam-label
          x={180}
          y={168}
          textAnchor="middle"
          className="fill-foreground text-caption font-semibold"
        >
          {t('design')}
        </text>
      </Board>
    </SlideFrame>
  ),
});
