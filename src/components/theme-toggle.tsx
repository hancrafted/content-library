'use client';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import type { Messages } from '@/lib/messages';
import { THEMES } from '@/lib/prefs.pure';

export function ThemeToggle({ labels }: { labels: Messages['theme'] }) {
  const [theme, setTheme] = useTheme();
  return (
    <div role="group" aria-label={labels.label} data-testid="theme-toggle" className="flex gap-1">
      {THEMES.map((option) => (
        <Button
          key={option}
          type="button"
          size="sm"
          variant={option === theme ? 'default' : 'outline'}
          aria-pressed={option === theme}
          data-testid={`theme-${option}`}
          data-active={option === theme}
          onClick={() => setTheme(option)}
        >
          {labels[option]}
        </Button>
      ))}
    </div>
  );
}
