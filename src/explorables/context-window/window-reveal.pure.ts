/* Scrolling a chat bubble into the chat's own scroll box, never the page. */

interface Span {
  readonly top: number;
  readonly height: number;
}

const PAD = 24;

/** The scroll position that shows a bubble: unchanged when it is fully in view, else centred, or top-aligned if taller. */
export function revealTop(box: Span & { readonly scrollTop: number }, el: Span): number {
  const offset = el.top - box.top;
  if (offset >= 0 && offset + el.height <= box.height) return box.scrollTop;
  if (el.height > box.height) return Math.max(0, box.scrollTop + offset - PAD);
  return Math.max(0, box.scrollTop + offset - (box.height - el.height) / 2);
}
