'use client';

import { Button } from '@/shared/components/ui/button';
import { isAnySectionActive } from '@/shared/lib/locale.pure';
import { cn } from '@/shared/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';

export function NavLink({
  section,
  alsoIn = [],
  className,
  ...props
}: { section: string; alsoIn?: readonly string[] } & Omit<ComponentProps<typeof Link>, 'aria-current'>) {
  const active = isAnySectionActive(usePathname(), [section, ...alsoIn]);
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={cn(
        active
          ? 'bg-selected text-selected-foreground hover:bg-selected hover:text-selected-foreground'
          : 'text-muted-foreground',
        className,
      )}
    >
      <Link {...props} aria-current={active ? 'page' : undefined} data-active={active} />
    </Button>
  );
}
