'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { useTocTooltip } from '@/shared/hooks/use-toc-tooltip';
import type { TocCollection, TocScope } from '@/shared/lib/table-of-contents.pure';
import { ZoomIn, ZoomOut } from 'lucide-react';
import type { TocLabels } from './toc-heading';

interface ScopeProps {
  collection?: TocCollection;
  scope: TocScope;
  labels: TocLabels;
  onToggleScope: () => void;
}

export function ScopeButton(props: ScopeProps) {
  const tooltip = useTocTooltip();
  if (!props.collection) return null;
  const isCollection = props.scope === 'collection';
  const label = isCollection ? props.labels.zoomIn : props.labels.zoomOut;
  const Icon = isCollection ? ZoomIn : ZoomOut;
  return (
    <Tooltip open={tooltip.open} onOpenChange={tooltip.onOpenChange}>
      <TooltipTrigger asChild>
        <button
          ref={tooltip.trigger}
          type="button"
          aria-label={label}
          aria-pressed={isCollection}
          data-testid="toc-zoom"
          onClick={props.onToggleScope}
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 md:size-8"
        >
          <Icon aria-hidden className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" container={tooltip.container} className="pointer-events-auto">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
