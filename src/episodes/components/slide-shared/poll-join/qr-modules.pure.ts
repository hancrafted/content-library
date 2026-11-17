import { create } from 'qrcode';

const QUIET_ZONE = 2;

const POLL_HOST = 'https://directpoll.com/';

export interface QrModules {
  readonly size: number;
  readonly path: string;
}

export function isPlaceholderPollUrl(url: string): boolean {
  return !url.startsWith(POLL_HOST) || /placeholder/i.test(url);
}

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
