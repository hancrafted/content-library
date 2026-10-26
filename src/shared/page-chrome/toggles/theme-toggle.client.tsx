'use client';

import { Button } from '@/shared/components/ui/button';
import { useTheme } from '@/shared/hooks/use-theme';
import { THEMES, type Theme } from '@/shared/lib/prefs.pure';
import { SEGMENTED_GROUP, segmentedItem } from '@/shared/page-chrome/toggles/segmented';
import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import type { Messages } from 'next-intl';

const ICONS: Record<Theme, LucideIcon> = { light: Sun, dark: Moon, system: Monitor };

export function ThemeToggle({ labels }: { labels: Messages['theme'] }) {
  const [theme, setTheme] = useTheme();
  return (
    <div role="group" aria-label={labels.label} data-testid="theme-toggle" className={SEGMENTED_GROUP}>
      {THEMES.map((option) => {
        const Icon = ICONS[option];
        return (
          <Button
            key={option}
            type="button"
            size="icon"
            variant="ghost"
            className={segmentedItem(option === theme)}
            aria-pressed={option === theme}
            aria-label={labels[option]}
            title={labels[option]}
            data-testid={`theme-${option}`}
            data-active={option === theme}
            onClick={() => setTheme(option)}
          >
            <Icon aria-hidden />
          </Button>
        );
      })}
    </div>
  );
}
