'use client';

import { SEGMENTED_GROUP, segmentedItem } from '@/components/segmented';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import type { Messages } from '@/lib/messages';
import { THEMES, type Theme } from '@/lib/prefs.pure';
import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';

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
