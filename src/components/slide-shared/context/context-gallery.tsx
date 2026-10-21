import { EPISODE_PORTAL_ROOT_ID } from '@/lib/episode-portal.pure';
import { CallTranscript } from '../call-transcript/call-transcript';
import { Context, ContextBarsPreset } from './context';
import { CONTEXT_PRESETS, MINI_PRESETS } from './context-data';

/*
 * Dev only: every Preset of the cornerstone on one page, so each Section job only places the parts. Reached from the
 * /episodes page under `next dev`; `next build` never imports it (a post-build test holds that).
 */

const SAMPLE_CALL = [
  { who: 'you', text: 'A party for 40 on 27 June, budget 40,000.', light: 'lit' },
  { who: 'sister', text: 'Outdoors? What about the music?', light: 'faded' },
  { who: 'you', text: 'Pepper is allergic to nuts.', light: 'standout' },
  { who: 'sister', text: 'So: 40 people, 27 June, no nuts.', light: 'lit' },
] as const;

export function ContextGallery({ locale }: { readonly locale: string }) {
  return (
    <section aria-labelledby="shared-visuals" className="flex flex-col gap-12 border-t border-border pt-12">
      <h2 id="shared-visuals" className="text-heading font-semibold">
        Shared visuals · context window
      </h2>
      {CONTEXT_PRESETS.map((id) => (
        <article key={id} id={`preset-${id}`} className="flex flex-col gap-3">
          <h3 className="text-subheading font-semibold">{id}</h3>
          <Context preset={id} locale={locale} />
        </article>
      ))}
      {MINI_PRESETS.map((id) => (
        <article key={id} id={`preset-${id}`} className="flex flex-col gap-3">
          <h3 className="text-subheading font-semibold">{id}</h3>
          <ContextBarsPreset preset={id} locale={locale} />
        </article>
      ))}
      <article id="call-transcript" className="flex max-w-xl flex-col gap-3">
        <h3 className="text-subheading font-semibold">call-transcript</h3>
        <CallTranscript label="Sample call" lines={SAMPLE_CALL} />
      </article>
      {/* An Episode page hosts this root; the gallery stands in for one so the popovers (the Attention menu) open. */}
      <div id={EPISODE_PORTAL_ROOT_ID} data-slot="portal-root" className="pointer-events-none fixed inset-0 z-50" />
    </section>
  );
}
