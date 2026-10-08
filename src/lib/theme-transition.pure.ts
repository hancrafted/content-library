import gsap from 'gsap';

export interface ThemeColors {
  bg: string;
  fg: string;
  border: string;
}

const DARK_INTERPOLATION = {
  bg: ['#FAF9F6', '#CBD5E1', '#475569', '#1E293B', '#0B0F17'],
  fg: ['#0A0E1A', '#0A0E1A', '#1E293B', '#F8FAFC', '#F8FAFC'],
  border: [
    'rgba(10, 14, 26, 0.12)',
    'rgba(10, 14, 26, 0.12)',
    'rgba(255, 255, 255, 0.15)',
    'rgba(255, 255, 255, 0.12)',
    'rgba(255, 255, 255, 0.08)',
  ],
};

const LIGHT_INTERPOLATION = {
  bg: ['#0A0E1A', '#1E293B', '#475569', '#CBD5E1', '#FAF9F6'],
  fg: ['#F8FAFC', '#F8FAFC', '#1E293B', '#0A0E1A', '#0A0E1A'],
  border: [
    'rgba(255, 255, 255, 0.12)',
    'rgba(255, 255, 255, 0.12)',
    'rgba(10, 14, 26, 0.15)',
    'rgba(10, 14, 26, 0.12)',
    'rgba(10, 14, 26, 0.08)',
  ],
};

function interpolateTheme(t: number, palette: typeof LIGHT_INTERPOLATION): ThemeColors {
  const toBg = gsap.utils.interpolate(palette.bg);
  const toFg = gsap.utils.interpolate(palette.fg);
  const toBorder = gsap.utils.interpolate(palette.border);
  return { bg: toBg(t), fg: toFg(t), border: toBorder(t) };
}

export function computeThemeColors(p: number, isDarkSiteTheme: boolean): ThemeColors {
  if (isDarkSiteTheme) {
    if (p <= 0.75) {
      return { bg: '#FAF9F6', fg: '#0A0E1A', border: 'rgba(10, 14, 26, 0.12)' };
    }
    const t = Math.min(1, (p - 0.75) / 0.22);
    return interpolateTheme(t, DARK_INTERPOLATION);
  }

  if (p <= 0.75) {
    return { bg: '#0A0E1A', fg: '#F8FAFC', border: 'rgba(255, 255, 255, 0.12)' };
  }
  const t = Math.min(1, (p - 0.75) / 0.22);
  return interpolateTheme(t, LIGHT_INTERPOLATION);
}

export function computeActiveStep(p: number): number {
  if (p < 0.26) return 1;
  if (p < 0.51) return 2;
  if (p < 0.76) return 3;
  if (p < 0.97) return 4;
  return 5;
}
