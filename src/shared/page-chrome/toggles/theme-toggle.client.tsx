'use client';

import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { useTheme } from '@/shared/hooks/use-theme';
import { THEMES, type Theme } from '@/shared/lib/prefs.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { SEGMENTED_GROUP, segmentedItem } from '@/shared/page-chrome/toggles/segmented';
import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import type { Messages } from 'next-intl';
import { useState } from 'react';

const ICONS: Record<Theme, LucideIcon> = { light: Sun, dark: Moon, system: Monitor };

interface ThemeControls {
  labels: Messages['theme'];
  theme: Theme | null;
  setTheme: (theme: Theme) => void;
  container: HTMLDivElement | null;
}

function ThemeCycle({ theme, setTheme, labels, container }: ThemeControls) {
  const current = theme ?? 'system';
  const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
  const CurrentIcon = ICONS[current];
  const switchLabel = fillTemplate(labels.switch, { current: labels[current], next: labels[next] });
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="hidden size-11 text-foreground lg:inline-flex"
          aria-label={switchLabel}
          data-testid="theme-cycle"
          onClick={() => setTheme(next)}
        >
          <CurrentIcon aria-hidden className="size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" container={container} onEscapeKeyDown={(event) => event.stopPropagation()}>
        {switchLabel}
      </TooltipContent>
    </Tooltip>
  );
}

function ThemeChoice({ option, theme, setTheme, labels, container }: ThemeControls & { option: Theme }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={`min-h-11 min-w-0 flex-1 px-1.5 text-caption ${segmentedItem(option === theme)}`}
          aria-pressed={option === theme}
          aria-label={labels[option]}
          data-testid={`theme-${option}`}
          data-active={option === theme}
          onClick={() => setTheme(option)}
        >
          {labels[option]}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" container={container} onEscapeKeyDown={(event) => event.stopPropagation()}>
        {labels[option]}
      </TooltipContent>
    </Tooltip>
  );
}

export function ThemeToggle({ labels }: { labels: Messages['theme'] }) {
  const [theme, setTheme] = useTheme();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const controls = { labels, theme, setTheme, container };
  return (
    <div
      ref={setContainer}
      role="group"
      aria-label={labels.label}
      data-testid="theme-toggle"
      className="w-full lg:w-auto"
    >
      <ThemeCycle {...controls} />
      <div className={`${SEGMENTED_GROUP} w-full lg:hidden`}>
        {THEMES.map((option) => (
          <ThemeChoice key={option} option={option} {...controls} />
        ))}
      </div>
    </div>
  );
}
