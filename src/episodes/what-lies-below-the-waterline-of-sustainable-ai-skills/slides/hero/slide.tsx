import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The Title slide's hero Scene (the record's `title`), the Hero motif of picked Option 0a: the research ship on the
 * waterline has lowered its diving robot from the A-frame to hang just above the water, and one pill marks it as the
 * Surface on the depth ruler. The shared header renders the `h1` and the Episode's caption above it; each section slide
 * echoes the scene one zone deeper (`slide-shared/waterline-echo/`).
 *
 * The dive scene is a slot: design-ADR-0025 gives the scenery and iceberg to `implement-iceberg-style` and the ship,
 * crew and robot to `implement-scene-cast`. The ruler's zone names stay visible; their popover is the iceberg job's.
 */
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t }) => {
    const zones = [
      { zone: 'surface', label: t('zones.surface.label'), ocean: t('zones.surface.ocean') },
      { zone: 'sunlit', label: t('zones.sunlit.label'), ocean: t('zones.sunlit.ocean') },
      { zone: 'twilight', label: t('zones.twilight.label'), ocean: t('zones.twilight.ocean') },
      { zone: 'midnight', label: t('zones.midnight.label'), ocean: t('zones.midnight.ocean') },
      { zone: 'abyss', label: t('zones.abyss.label'), ocean: t('zones.abyss.ocean') },
    ];
    const files = [
      { name: t('agent.files.skill.name'), role: t('agent.files.skill.role') },
      { name: t('agent.files.folders.name'), role: t('agent.files.folders.role') },
      { name: t('agent.files.project.name'), role: t('agent.files.project.role') },
    ];
    return (
      <>
        {/* The Title slide's one Backdrop, empty: the scene draws inside the frame. */}
        <SlideBackdrop mobile />
        <SlideFrame className="mt-10">
          <div className="relative isolate aspect-[1200/820] w-full overflow-hidden rounded-2xl">
            {/* filled by implement-iceberg-style (ZoneScene: sky, sea bands, iceberg, waterline glow) and
              implement-scene-cast (Ship with the crew, the A-frame, cable and Robot with its lamp lit). */}
            <div
              data-slot="dive-scene"
              data-zone="surface"
              role="img"
              aria-label={t('label')}
              className="absolute inset-0 -z-10 bg-muted"
            />
            {/* filled by implement-iceberg-style: the depth ruler drawn onto the scene, Surface above the waterline. */}
            <ol data-slot="depth-ruler" className="absolute top-[40%] left-6 flex flex-col gap-6">
              {zones.map(({ zone, label, ocean }) => (
                <li
                  key={zone}
                  data-ruler-zone={zone}
                  data-lit={zone === 'surface' ? '' : undefined}
                  className="flex items-center gap-2 text-caption font-semibold text-foreground"
                >
                  <span
                    aria-hidden="true"
                    className={
                      zone === 'surface'
                        ? 'h-1 w-6 rounded-sm bg-primary'
                        : 'h-1 w-3.5 rounded-sm bg-foreground opacity-50'
                    }
                  />
                  <span data-zone-name>{label}</span>
                  <span className="sr-only">{ocean}</span>
                </li>
              ))}
            </ol>
            <p
              data-you-are-here
              className="absolute top-[52%] left-[46%] rounded-full bg-primary px-3 py-1 text-caption font-semibold text-primary-foreground shadow-md"
            >
              {t('youAreHere')}
            </p>
            <div
              data-view="coding"
              className="absolute right-6 bottom-6 hidden w-80 rounded-xl bg-card p-4 text-card-foreground shadow-md"
            >
              <p className="text-caption font-semibold text-primary uppercase">{t('agent.heading')}</p>
              <ul className="mt-2 flex flex-col gap-2 text-caption">
                {files.map(({ name, role }) => (
                  <li key={name} className="flex flex-col">
                    <span data-file-name className="font-mono font-semibold">
                      {name}
                    </span>
                    <span className="text-muted-foreground">{role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SlideFrame>
      </>
    );
  },
});
