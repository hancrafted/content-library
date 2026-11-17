interface Span {
  readonly top: number;
  readonly height: number;
}

const PAD = 24;

export function revealTop(box: Span & { readonly scrollTop: number }, el: Span): number {
  const offset = el.top - box.top;
  if (offset >= 0 && offset + el.height <= box.height) return box.scrollTop;
  if (el.height > box.height) return Math.max(0, box.scrollTop + offset - PAD);
  return Math.max(0, box.scrollTop + offset - (box.height - el.height) / 2);
}
