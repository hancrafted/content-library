import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Arrow, Board } from '@/episodes/components/slide-shared/party-board/board';
import { Note } from '@/episodes/components/slide-shared/party-board/note';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { TeamTag } from './team-tag';

const MID = 180;

export const aThoughtExperiment = slide({
  slug: 'a-thought-experiment',
  messages: { en, de },
  segments: [{ slug: 'imagine-the-board' }],
  content: ({ t }) => (
    <SlideFrame>
      <Board label={t('board')}>
        <TeamTag x={8} y={16} width={124} label={t('seam.from.team')} />
        <TeamTag x={228} y={16} width={124} label={t('seam.to.team')} />
        <Note box={{ x: 18, y: 52, width: 104, height: 52 }} tilt={-2} ticked lines={t('seam.from.note').split('\n')} />
        <Note
          box={{ x: 238, y: 52, width: 104, height: 52 }}
          tilt={2}
          ticked
          look="fail"
          lines={t('seam.to.note').split('\n')}
        />
        <Arrow from={126} to={234} y={70} />
        <Arrow from={234} to={126} y={90} tone="destructive" />
        <text x={MID} y={64} textAnchor="middle" className="fill-muted-foreground text-caption">
          {t('seam.handoff')}
        </text>
        <text x={MID} y={114} textAnchor="middle" className="fill-destructive text-caption font-medium">
          {t('seam.back')}
        </text>
        <text data-breaks x={MID} y={142} textAnchor="middle" className="fill-destructive text-caption font-semibold">
          {t('breaks')}
        </text>
        <text x={MID} y={164} textAnchor="middle" className="fill-muted-foreground text-caption">
          {t('footer')}
        </text>
      </Board>
    </SlideFrame>
  ),
});
