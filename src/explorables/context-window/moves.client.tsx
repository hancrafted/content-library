'use client';

// decision: ARCH-003 §5
import { useMotion } from '@/shared/hooks/use-motion';
import type { ComponentPropsWithoutRef, ElementType } from 'react';

type MovesProps<T extends ElementType> = { readonly as?: T; readonly trigger?: unknown } & Omit<
  ComponentPropsWithoutRef<T>,
  'as' | 'trigger'
>;

export function Moves<T extends ElementType = 'div'>({ as, trigger, ...rest }: MovesProps<T>) {
  const motion = useMotion(trigger);
  const Tag: ElementType = as ?? 'div';
  return <Tag {...rest} {...motion} />;
}
