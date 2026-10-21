import { defOf } from './context-controls.pure';
import type { HeadToggle } from './context-parts.types';
import type { Say } from './context-view';
import { ControlIcon, IconButton } from './control-icons';

/* The icon buttons in a part's head: the local Technical, and the smart-zone column on the context window. */

export function HeadToggles({ toggles, say }: { readonly toggles: readonly HeadToggle[]; readonly say: Say }) {
  return toggles.map((toggle) => {
    const def = defOf(toggle.id);
    if (def.type !== 'toggle') return null;
    return (
      <IconButton
        key={toggle.id}
        label={say.words[def.label]}
        tip={say.words[def.tip]}
        pressed={toggle.pressed}
        control={toggle.id}
        onClick={toggle.onToggle}
      >
        <ControlIcon name={def.icon} />
      </IconButton>
    );
  });
}
