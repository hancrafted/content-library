import { externalHref } from '@/lib/external-link.pure';
import type { Locale } from '@/lib/locale.pure';
import { SOCIAL_LINKS, type SocialId } from '@/lib/social-links';
import { cn } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

/** lucide-react ships no brand marks, so these are small inline paths (24px grid, filled). */
const MARKS: Record<SocialId, ReactNode> = {
  youtube: (
    <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2C.5 9.1.5 12 .5 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8ZM9.8 15.2V8.8l5.9 3.2-5.9 3.2Z" />
  ),
  github: (
    <path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5Z" />
  ),
  linkedin: (
    <path d="M20.4 20.5h-3.6v-5.6c0-1.300 0-3-1.800-3s-2.100 1.400-2.100 2.900v5.700H9.400V9h3.400v1.600c.5-.9 1.600-1.800 3.400-1.800 3.600 0 4.300 2.400 4.300 5.500v6.200ZM5.300 7.400a2.100 2.100 0 1 1 0-4.100 2.100 2.100 0 0 1 0 4.100ZM7.100 20.500H3.600V9h3.500v11.500Z" />
  ),
};

function SocialLink({ id, url, name, newTab }: { id: SocialId; url: string; name: string; newTab: string }) {
  return (
    <li>
      <a
        href={externalHref(url)}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={`social-${id}`}
        className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className="size-5">
          {MARKS[id]}
        </svg>
        <span className="sr-only">
          {name} ({newTab})
        </span>
      </a>
    </li>
  );
}

/** Icon links to the social profiles; the accessible name is "<network> (<newTab hint>)". */
export async function SocialLinks({ locale, className }: { locale: Locale; className?: string }) {
  const t = await getTranslations({ locale });
  return (
    <ul aria-label={t('social.label')} className={cn('flex items-center', className)}>
      {SOCIAL_LINKS.map(({ id, href }) => (
        <SocialLink key={id} id={id} url={href} name={t(`social.${id}`)} newTab={t('nav.newTab')} />
      ))}
    </ul>
  );
}
