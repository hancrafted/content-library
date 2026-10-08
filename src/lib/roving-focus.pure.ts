/*
 * Roving focus over a list of ids, as the WAI-ARIA Authoring Practices walk
 * tabs and menus: two arrow keys step and wrap, Home and End jump. One walker,
 * two orientations; any other key is not the list's, so it returns `null`.
 */

type ItemAfter = (key: string, current: string, items: readonly string[]) => string | null;

function walker(previous: string, next: string): ItemAfter {
  return (key, current, items) => {
    const at = items.indexOf(current);
    const step: Record<string, number> = { [next]: at + 1, [previous]: at - 1, Home: 0, End: items.length - 1 };
    if (!(key in step)) return null;
    return items[(step[key] + items.length) % items.length];
  };
}

/** APG tabs: horizontal arrows wrap, Home and End jump. */
export const tabAfter: ItemAfter = walker('ArrowLeft', 'ArrowRight');

/** APG menu: vertical arrows wrap, Home and End jump. */
export const menuItemAfter: ItemAfter = walker('ArrowUp', 'ArrowDown');
