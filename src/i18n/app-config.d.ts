import type { Locale } from '@/lib/locale.pure';
import type {} from 'next-intl';
import type { Messages } from './translations';

/**
 * Types every `t('…')` key and `locale` argument against the Translation files.
 * The empty import loads `next-intl` into every program, so the augmentation
 * applies even when no other file imports the package's main entry; without it
 * `next-intl/server` translators silently accept any key.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
