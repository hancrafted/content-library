type ItemAfter = (key: string, current: string, items: readonly string[]) => string | null;

function walker(previous: string, next: string): ItemAfter {
  return (key, current, items) => {
    const at = items.indexOf(current);
    const step: Record<string, number> = { [next]: at + 1, [previous]: at - 1, Home: 0, End: items.length - 1 };
    if (!(key in step)) return null;
    return items[(step[key] + items.length) % items.length];
  };
}

export const tabAfter: ItemAfter = walker('ArrowLeft', 'ArrowRight');

export const menuItemAfter: ItemAfter = walker('ArrowUp', 'ArrowDown');
