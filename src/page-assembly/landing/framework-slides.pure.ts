import type { Locale } from '@/shared/lib/locale.pure';

interface SlideBase {
  step: string;
  letter: string;
  iconName: 'users' | 'undo-2' | 'car' | 'hand-helping' | 'refresh-cw';
  proof?: { href: string; label: string };
}

interface NotedSlide extends SlideBase {
  id: 'people-first' | 'reason-backwards' | 'obsolete-by-design';
  note: { href?: Record<Locale, string> };
}

interface PlainSlide extends SlideBase {
  id: 'outcomes-over-methods' | 'fast-feedback';
  note?: undefined;
}

export type FrameworkSlideData = NotedSlide | PlainSlide;

export const FRAMEWORK_SLIDES: readonly FrameworkSlideData[] = [
  {
    id: 'people-first',
    step: '01',
    letter: 'P',
    iconName: 'users',
    note: {
      href: {
        en: 'https://en.wikipedia.org/wiki/Conway%27s_law',
        de: 'https://de.wikipedia.org/wiki/Gesetz_von_Conway',
      },
    },
  },
  { id: 'reason-backwards', step: '02', letter: 'R', iconName: 'undo-2', note: {} },
  { id: 'outcomes-over-methods', step: '03', letter: 'O', iconName: 'car' },
  { id: 'obsolete-by-design', step: '04', letter: 'O', iconName: 'hand-helping', note: {} },
  { id: 'fast-feedback', step: '05', letter: 'F', iconName: 'refresh-cw' },
];
