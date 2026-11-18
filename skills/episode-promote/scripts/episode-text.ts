import { existsSync } from 'node:fs';
import path from 'node:path';
import { LOCALES, type Locale } from '../../../src/episodes/lib/episode-outline.ts';
import { episodeTextOf } from './episode-text-disk.ts';

const args = process.argv.slice(2);
const localeAt = args.indexOf('--locale');
const locale = (localeAt === -1 ? 'en' : args[localeAt + 1]) as Locale;
const slug = args.find((arg, index) => !arg.startsWith('--') && (localeAt === -1 || index !== localeAt + 1));
if (!slug || !LOCALES.includes(locale) || !existsSync(path.join('src/episodes', slug))) {
  console.error('usage: npm run episode:text -- <slug> [--locale de]  (run from the repo root)');
  process.exit(1);
}

process.stdout.write(episodeTextOf(process.cwd(), slug, locale));
