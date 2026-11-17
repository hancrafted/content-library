import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// decision: FE-011 §3
const twMerge = extendTailwindMerge({
  extend: { classGroups: { 'font-size': [{ text: ['caption', 'body', 'subheading', 'heading', 'hero'] }] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
