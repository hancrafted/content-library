import { create } from 'qrcode';

/** The quiet zone around the modules, in modules: the QR standard asks for four, two scan fine on a lit tile. */
const QUIET_ZONE = 2;

/** The Vote link's host: a poll QR points only here, so a copied placeholder never turns into a code for another site. */
const POLL_HOST = 'https://directpoll.com/';

/** A QR as one SVG path: its side in modules, quiet zone included, and the path of its dark modules. */
export interface QrModules {
  readonly size: number;
  readonly path: string;
}

/**
 * True when a poll URL is still a placeholder: empty, not on directpoll, or spelled PLACEHOLDER. The template's and an
 * unfinished copy's Slides show a note instead of a code that would scan to nothing.
 */
export function isPlaceholderPollUrl(url: string): boolean {
  return !url.startsWith(POLL_HOST) || /placeholder/i.test(url);
}

/** The QR for a URL, drawn at build time: each horizontal run of dark modules is one `M x y h n v1 h-n z`. */
export function qrModules(url: string): QrModules {
  const { size, data } = create(url, { errorCorrectionLevel: 'M' }).modules;
  const runs: string[] = [];
  for (let y = 0; y < size; y += 1) {
    let x = 0;
    while (x < size) {
      if (!data[y * size + x]) {
        x += 1;
        continue;
      }
      const start = x;
      while (x < size && data[y * size + x]) x += 1;
      runs.push(`M${start + QUIET_ZONE} ${y + QUIET_ZONE}h${x - start}v1h-${x - start}z`);
    }
  }
  return { size: size + QUIET_ZONE * 2, path: runs.join('') };
}
