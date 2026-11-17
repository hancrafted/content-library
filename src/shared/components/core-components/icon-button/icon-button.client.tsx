'use client';

import { useMotion } from '@/shared/hooks/use-motion';
import type { ButtonHTMLAttributes } from 'react';
import { Tip } from '../tip/tip.client';

export const OUTLINED_ICON =
  'inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'type'> {
  readonly label: string;
  readonly tip?: string | false;
  readonly place?: 'below' | 'above';
  readonly align?: 'start' | 'center' | 'end';
}

export function IconButton({ label, tip = label, place, align, className = OUTLINED_ICON, ...rest }: IconButtonProps) {
  const motion = useMotion();
  const button = <button type="button" aria-label={label} className={className} {...motion} {...rest} />;
  if (tip === false) return button;
  return (
    <Tip text={tip} place={place} align={align}>
      {button}
    </Tip>
  );
}
