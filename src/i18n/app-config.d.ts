import type { Locale } from '@/lib/locale.pure';
import type { Messages } from './translations';

/** Types every `t('…')` key and `locale` argument against the Translation files. */
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
