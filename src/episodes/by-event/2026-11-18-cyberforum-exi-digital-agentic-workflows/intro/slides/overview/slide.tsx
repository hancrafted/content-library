import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

const ARTWORK: Record<'enablement' | 'engineering' | 'foundation', ReactNode> = {
  enablement: (
    <>
      <circle cx="170" cy="106" r="85" fill="currentColor" stroke="none" opacity="0.1" />
      <rect x="88" y="44" width="164" height="118" rx="10" />
      <path d="M88 64h164M118 64v98M96 78h14M96 90h14M96 102h14" />
      <circle cx="100" cy="54" r="2.5" />
      <circle cx="109" cy="54" r="2.5" />
      <rect x="132" y="76" width="70" height="16" rx="8" />
      <rect x="160" y="100" width="78" height="16" rx="8" />
      <rect x="132" y="130" width="106" height="20" rx="6" />
      <path d="M226 136v6m-3-3h6" />
      <circle cx="146" cy="84" r="3" fill="currentColor" stroke="none" />
    </>
  ),
  engineering: (
    <>
      <circle cx="170" cy="106" r="85" fill="currentColor" stroke="none" opacity="0.1" />
      <rect x="74" y="52" width="104" height="72" rx="8" />
      <path d="M74 68h104M88 84l10 8-10 8M106 102h22" />
      <rect x="162" y="94" width="104" height="72" rx="8" />
      <path d="M162 110h104M176 126l10 8-10 8M194 144h22" />
      <path d="M126 124v30a12 12 0 0 0 12 12h24M252 94V64a12 12 0 0 0-12-12h-62M188 46l-10 6 10 6" />
      <circle cx="126" cy="124" r="4" fill="currentColor" stroke="none" />
      <circle cx="252" cy="94" r="4" fill="currentColor" stroke="none" />
    </>
  ),
  foundation: (
    <>
      <path d="M60 150h220v30H60z" fill="currentColor" stroke="none" opacity="0.1" />
      <path d="M60 150h220v30H60zM60 165h220M110 150V90l-28-22M110 90l28-22M230 150V90l-28-22M230 90l28-22" />
      <circle cx="82" cy="68" r="10" />
      <circle cx="138" cy="68" r="10" />
      <circle cx="202" cy="68" r="10" />
      <circle cx="258" cy="68" r="10" />
      <circle cx="110" cy="90" r="5" fill="currentColor" stroke="none" />
      <circle cx="230" cy="90" r="5" fill="currentColor" stroke="none" />
    </>
  ),
};

function Artwork({ name, className }: { name: keyof typeof ARTWORK; className: string }) {
  return (
    <svg
      viewBox="0 0 340 212"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {ARTWORK[name]}
    </svg>
  );
}

const TRACKS = [
  { key: 'enablement', edge: 'border-t-(--info)', tone: 'text-(--info)' },
  { key: 'engineering', edge: 'border-t-brand-accent', tone: 'text-brand-accent' },
] as const;
const FACTS = ['who', 'tool', 'outcome'] as const;

export const overview = slide({
  slug: 'overview',
  messages: { en, de },
  notes: [{ slug: 'talking-points', target: 'tracks' }],
  content: ({ t, target }) => (
    <SlideFrame className="justify-center">
      <div {...target('tracks')} className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {TRACKS.map(({ key, edge, tone }) => (
          <section
            key={key}
            data-track={key}
            className={`flex flex-col gap-3 rounded-xl border border-t-4 border-border bg-card p-6 ${edge}`}
          >
            <div className={`h-36 rounded-lg bg-muted/50 p-2 ${tone}`}>
              <Artwork name={key} className="size-full" />
            </div>
            <span className={`text-caption font-semibold tracking-widest uppercase ${tone}`}>
              {t(`tracks.${key}.label`)}
            </span>
            <p className="text-subheading font-semibold">{t(`tracks.${key}.name`)}</p>
            <p className="text-body text-muted-foreground">{t(`tracks.${key}.body`)}</p>
            <dl className="mt-auto grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 pt-2 text-body">
              {FACTS.map((fact) => (
                <div key={fact} className="contents">
                  <dt className="text-caption font-semibold tracking-widest text-muted-foreground uppercase">
                    {t(`facts.${fact}`)}
                  </dt>
                  <dd>{t(`tracks.${key}.${fact}`)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <div className="flex items-center gap-6 rounded-xl bg-muted p-5 md:col-span-2">
          <Artwork name="foundation" className="hidden h-20 w-32 flex-none text-muted-foreground sm:block" />
          <div>
            <span className="text-caption font-semibold tracking-widest text-muted-foreground uppercase">
              {t('foundation.label')}
            </span>
            <p className="text-body font-semibold">{t('foundation.body')}</p>
          </div>
        </div>
      </div>
    </SlideFrame>
  ),
});
