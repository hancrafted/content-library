'use client';

import { useMotion } from '@/shared/hooks/use-motion';
import type { ComponentPropsWithoutRef, ElementType } from 'react';

type MovesProps<T extends ElementType> = { readonly as?: T; readonly trigger?: unknown } & Omit<
  ComponentPropsWithoutRef<T>,
  'as' | 'trigger'
>;

/*
 * An element of the Context that animates on a user action or an entrance: the tag `as` it names, carrying
 * `data-motion="running|settled"` (ARCH-003 §5). `trigger` is the state that sets its motion off.
 */
export function Moves<T extends ElementType = 'div'>({ as, trigger, ...rest }: MovesProps<T>) {
  const motion = useMotion(trigger);
  const Tag: ElementType = as ?? 'div';
  return <Tag {...rest} {...motion} />;
}
