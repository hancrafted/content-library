import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { agenda } from './slides/agenda/slide';

/*
 * The event-frame Episode of the AXEL seminar (2026-10-23): the agenda and scope of one Event, first in its
 * Playlist. Unlisted, so it lives only at `/events/2026-10-23-axel-agentic-workflow/episodes/<this slug>/`, and has no
 * video. It owns its Slides as any Episode does; the teaching Episodes follow it in the Playlist.
 */
export const axelAgenticWorkflowAgenda = episode({
  slug: 'axel-agentic-workflow-agenda',
  messages: { en, de },
  sections: [[agenda]],
});
