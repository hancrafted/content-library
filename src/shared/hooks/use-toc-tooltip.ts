import { useRef, useState } from 'react';
import { useEpisodePortalRoot } from './use-episode-portal-root';

/** Keep the scope tooltip above the rail, or within the mobile dialog's top layer. */
export function useTocTooltip() {
  const root = useEpisodePortalRoot();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return {
    trigger,
    open,
    onOpenChange: setOpen,
    container: trigger.current?.closest('dialog') ?? root ?? undefined,
  };
}
