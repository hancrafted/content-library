import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { PhoneCall, type CallEffect, type EffectCopy } from './phone-call';

const MURDOCK = { slug: 'murdock-serial-position', url: 'https://doi.org/10.1037/h0045106' };

/** The effects in the order the margin shows them, each with the Speaker note its Context marker opens. */
const EFFECT_NOTES = {
  start: 'why-the-start-sticks',
  middle: 'recall-is-u-shaped',
  standout: 'the-standout-survives',
  end: 'why-the-end-sticks',
} as const satisfies Record<CallEffect, string>;

const BUBBLES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

/*
 * "The long phone call" (Spec Option 1a): the call with your sister as one messenger thread on `SlideFrame`, its
 * three effects bracketed in the margin and the punchline as the brightest bubble. The Slide header above shows the
 * title and caption. Each effect's name carries the Context marker to its Speaker note, and the footnote opens "Lab
 * lists, not phone calls".
 */
export const theLongPhoneCallStory = slide({
  slug: 'the-long-phone-call-story',
  messages: { en, de },
  notes: [
    { slug: 'recall-is-u-shaped', target: 'middle', sources: [MURDOCK] },
    {
      slug: 'why-the-start-sticks',
      target: 'start',
      sources: [{ slug: 'rundus-rehearsal', url: 'https://doi.org/10.1037/h0031185' }],
    },
    {
      slug: 'why-the-end-sticks',
      target: 'end',
      sources: [
        { slug: 'glanzer-cunitz-two-stores', url: 'https://doi.org/10.1016/S0022-5371(66)80044-0' },
        { slug: 'bjork-whitten-recency', url: 'https://doi.org/10.1016/0010-0285(74)90009-7' },
      ],
    },
    {
      slug: 'the-standout-survives',
      target: 'standout',
      sources: [
        { slug: 'von-restorff-isolation', url: 'https://doi.org/10.1007/BF02409636' },
        { slug: 'hunt-distinctiveness', url: 'https://doi.org/10.3758/BF03214414' },
      ],
    },
    { slug: 'lab-lists-not-phone-calls', target: 'lab-note', sources: [MURDOCK] },
  ],
  segments: [
    { slug: 'the-start-sticks' },
    { slug: 'the-end-sticks' },
    { slug: 'the-middle-blurs' },
    { slug: 'one-thing-stands-out' },
    { slug: 'we-never-fixed-the-date' },
  ],
  content: ({ t, marker, Marker, target }) => {
    const effect = (name: CallEffect): EffectCopy => ({
      title: t(`effects.${name}.title`),
      term: t(`effects.${name}.term`),
      termHref: t(`effects.${name}.termHref`),
      explanation: t(`effects.${name}.explanation`),
      newTabHint: t('newTabHint'),
      marker: <Marker note={EFFECT_NOTES[name]} placement="beside" />,
      target: target(name),
    });
    return (
      <SlideFrame className="gap-6">
        <PhoneCall
          copy={{
            name: t('call.name'),
            duration: t('call.duration'),
            bubbles: BUBBLES.map((index) => t(`bubbles.${index}`)),
            punchline: t('punchline'),
            effects: {
              start: effect('start'),
              middle: effect('middle'),
              standout: effect('standout'),
              end: effect('end'),
            },
          }}
        />
        <p {...target('lab-note')} className="text-caption text-muted-foreground">
          {t.rich('labNote', { marker: marker('lab-lists-not-phone-calls') })}
        </p>
      </SlideFrame>
    );
  },
});
