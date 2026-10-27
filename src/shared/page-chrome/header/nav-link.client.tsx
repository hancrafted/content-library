'use client';

import { Button } from '@/shared/components/ui/button';
import { isAnySectionActive } from '@/shared/lib/locale.pure';
import { cn } from '@/shared/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';

/** A header link that highlights while the reader is anywhere inside `section`, or inside any of `alsoIn`. */
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
      <Link aria-current={active ? 'page' : undefined} data-active={active} {...props} />
    </Button>
  );
}
