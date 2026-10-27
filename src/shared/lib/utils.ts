import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/*
 * The type roles of FE-011 §3 (`text-caption`, `text-body`, …) are font sizes. Told nothing, tailwind-merge reads them
 * as colours and drops one of `text-caption text-muted-foreground`; registered here, a role and a colour both stay.
 */
const twMerge = extendTailwindMerge({
  extend: { classGroups: { 'font-size': [{ text: ['caption', 'body', 'subheading', 'heading', 'hero'] }] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
