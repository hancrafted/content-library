import type { Locale } from '@/lib/locale.pure';
import type { Messages } from './catalogs';

/** Types every `t('…')` key and `locale` argument against the catalogs. */
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
