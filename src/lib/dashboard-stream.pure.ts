/** Byte positions include the buffered tail; only complete newline-terminated records are decoded. */
export function createLogStream() {
  let offset = 0;
  let tail = new Uint8Array();
  return {
    get offset() {
      return offset;
    },
    append(bytes: Uint8Array, fileSize: number): { lines: string[]; reset: boolean } {
      const reset = fileSize < offset;
      if (reset) {
        offset = 0;
        tail = new Uint8Array();
      }
      const combined = new Uint8Array(tail.length + bytes.length);
      combined.set(tail);
      combined.set(bytes, tail.length);
      const lines: string[] = [];
      let start = 0;
      for (let at = 0; at < combined.length; at += 1) {
        if (combined[at] !== 10) continue;
        lines.push(new TextDecoder('utf-8', { fatal: true }).decode(combined.slice(start, at)));
        start = at + 1;
      }
      tail = combined.slice(start);
      offset += bytes.length;
      return { lines, reset };
    },
  };
}
