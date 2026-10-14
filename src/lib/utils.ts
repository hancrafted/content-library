import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// The type roles from `globals.css` (FE-011 §3): without this, tailwind-merge reads `text-body` as a colour and drops it beside `text-foreground`.
const twMerge = extendTailwindMerge({
  extend: { classGroups: { 'font-size': [{ text: ['hero', 'heading', 'subheading', 'body', 'caption'] }] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
