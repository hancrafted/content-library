import { slide } from '@/episodes/components/slide-master/slide';
import { MOODS } from '@/episodes/components/slide-shared/character/actor';
import { Character } from '@/episodes/components/slide-shared/character/character';
import { aiAgent } from '@/episodes/components/slide-shared/character/shared-presets';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { FigureGallery, Specimen } from '@/episodes/components/slide-shared/figure-gallery/figure-gallery';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const emote = slide({
  slug: 'emote',
  messages: { en, de },
  content: ({ t }) => (
    <FigureGallery
      item="emote"
      intro={t('intro')}
      contract={t('contract')}
      labels={{ pause: t('pause'), resume: t('resume'), replay: t('replay') }}
    >
      {MOODS.map((mood) => (
        <Specimen
          key={`captain-${mood}`}
          variant={`captain-${mood}`}
          label={`${t('actors.captain')}: ${t(`moods.${mood}`)}`}
          usage={t('usage')}
          code={`<Character preset={captain} pose="point" mood="${mood}" />`}
        >
          <Character preset={captain} pose="point" mood={mood} />
        </Specimen>
      ))}
      {MOODS.map((mood) => (
        <Specimen
          key={`agent-${mood}`}
          variant={`agent-${mood}`}
          label={`${t('actors.agent')}: ${t(`moods.${mood}`)}`}
          usage={t('usage')}
          code={`<Character preset={aiAgent} pose="hold" mood="${mood}" />`}
        >
          <Character preset={aiAgent} pose="hold" mood={mood} />
        </Specimen>
      ))}
      <Specimen
        variant="pilot-says"
        label={t('variants.pilotSays')}
        usage={t('usage')}
        code={'<Character preset={pilot} pose="sit"\n  mood="thinking" says={t("pilotSays")} />'}
        viewBox="-160 -210 420 260"
      >
        <Character preset={pilot} pose="sit" mood="thinking" says={t('pilotSays')} />
      </Specimen>
      <Specimen
        variant="captain-flip-says"
        label={t('variants.captainSays')}
        usage={t('usage')}
        code={'<Character preset={captain} pose="point"\n  flip says={t("captainSays")} />'}
        viewBox="-220 -210 420 260"
      >
        <Character preset={captain} pose="point" flip says={t('captainSays')} />
      </Specimen>
      {MOODS.map((mood) => (
        <Specimen
          key={`robot-${mood}`}
          variant={`robot-${mood}`}
          label={`${t('actors.robot')}: ${t(`moods.${mood}`)}`}
          usage={t('usage')}
          code={`<Robot mood="${mood}" />`}
          viewBox="-100 -85 360 210"
          zone="twilight"
        >
          <Robot mood={mood} />
        </Specimen>
      ))}
      <Specimen
        variant="robot-says"
        label={t('variants.robotSays')}
        usage={t('usage')}
        code={'<Robot mood="confused" says={t("robotSays")} />'}
        viewBox="-100 -125 360 250"
        zone="twilight"
      >
        <Robot mood="confused" says={t('robotSays')} />
      </Specimen>
      <Specimen
        variant="robot-flip"
        label={t('variants.robotFlip')}
        usage={t('usage')}
        code={'<Robot flip mood="thinking" />'}
        viewBox="-250 -85 360 210"
        zone="twilight"
      >
        <Robot flip mood="thinking" />
      </Specimen>
    </FigureGallery>
  ),
});
