'use client';

import { Button } from '@/components/ui/button';
import { isSectionActive } from '@/lib/locale.pure';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';

/** A header link that highlights while the reader is anywhere inside `section`. */
export function NavLink({
  section,
  className,
  ...props
}: { section: string } & Omit<ComponentProps<typeof Link>, 'aria-current'>) {
  const active = isSectionActive(usePathname(), section);
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={cn(active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground', className)}
    >
      <Link aria-current={active ? 'page' : undefined} data-active={active} {...props} />
    </Button>
  );
}
