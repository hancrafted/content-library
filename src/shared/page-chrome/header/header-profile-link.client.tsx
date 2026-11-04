'use client';

import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { externalHref } from '@/shared/lib/external-link.pure';
import type { SocialId } from '@/shared/lib/social-links';
import { useState, type ReactNode } from 'react';

interface HeaderProfileProps {
  id: SocialId;
  url: string;
  name: string;
  newTab: string;
  description: string;
  children: ReactNode;
}

export function HeaderProfileLink({ id, url, name, newTab, description, children }: HeaderProfileProps) {
  const [container, setContainer] = useState<HTMLLIElement | null>(null);
  return (
    <li ref={setContainer} className="max-lg:flex-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            size="icon"
            variant="ghost"
            className="size-11 text-caption text-foreground max-lg:w-full max-lg:gap-1 max-lg:px-1"
          >
            <a href={externalHref(url)} target="_blank" rel="noopener noreferrer" data-testid={`social-${id}`}>
              <span className="shrink-0">{children}</span>
              <span className="lg:sr-only">{name}</span>
              <span className="sr-only"> ({newTab})</span>
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" container={container} onEscapeKeyDown={(event) => event.stopPropagation()}>
          {description}
        </TooltipContent>
      </Tooltip>
    </li>
  );
}
