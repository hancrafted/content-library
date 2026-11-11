import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Dartboard } from '@/episodes/components/slide-shared/dartboard/dartboard';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Context is the requirement", echoing the Hero motif: the dartboard inside the context window
// frame, in `machine`, static and dynamic context feeding it.
export const contextIsTheRequirement = slide({
  slug: 'context-is-the-requirement',
  messages: { en, de },
  segments: [{ slug: 'the-claim' }, { slug: 'the-route' }],
  content: ({ t }) => (
    <SlideFrame>
      <svg viewBox="0 0 300 150" className="w-full max-w-xl" role="img" aria-label={t('label')}>
        <rect x={6} y={10} width={288} height={134} rx={12} className="fill-card stroke-machine" strokeWidth={2} />
        <path d="M6 34 H294" className="stroke-machine" strokeWidth={1.5} />
        <text x={18} y={27} className="fill-machine text-caption font-semibold">
          {t('contextWindow')}
        </text>
        <rect x={18} y={46} width={78} height={36} rx={6} className="fill-machine/15" />
        <text x={57} y={69} textAnchor="middle" className="fill-machine text-caption font-medium">
          {t('static')}
        </text>
        <rect x={18} y={94} width={78} height={38} rx={6} className="fill-machine/15" />
        <text x={57} y={118} textAnchor="middle" className="fill-machine text-caption font-medium">
          {t('dynamic')}
        </text>
        <Dartboard cx={200} cy={89} r={48} rings={2} bull={10} />
        <path d="M100 64 Q150 60 186 84" className="fill-none stroke-machine" strokeWidth={1.5} strokeDasharray="4 4" />
        <path
          d="M100 112 Q150 116 186 94"
          className="fill-none stroke-machine"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
      </svg>
    </SlideFrame>
  ),
});
