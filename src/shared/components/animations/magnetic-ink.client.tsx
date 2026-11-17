'use client';

import { createInkBrowser, type InkOptions } from '@/shared/hooks/magnetic-ink-browser';
import { InkPageContext, useMagneticInk } from '@/shared/hooks/use-magnetic-ink';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './magnetic-ink.module.css';

export function InkPage({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <InkSession key={pathname}>{children}</InkSession>;
}

function InkSession({ children }: { children: ReactNode }) {
  const [page] = useState(createInkBrowser);
  useEffect(() => page.mount(), [page]);
  return <InkPageContext value={page}>{children}</InkPageContext>;
}

export function MagneticInk({ children, kind = 'button' }: { children: ReactNode; kind?: InkOptions['kind'] }) {
  const attachment = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLElement>(null);
  useEffect(() => {
    host.current = attachment.current?.firstElementChild as HTMLElement | null;
  }, []);
  useMagneticInk(host, { kind });
  return (
    <div ref={attachment} className={styles.attachment}>
      {children}
    </div>
  );
}
