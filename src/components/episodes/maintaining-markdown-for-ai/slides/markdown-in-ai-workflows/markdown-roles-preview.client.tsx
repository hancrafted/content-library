'use client';

import { cn } from '@/lib/utils';
import type { RefObject } from 'react';
import type { ModalKey, RoleDetail } from './markdown-roles-data.pure';

function FileHeader({ role }: { role: RoleDetail }) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-muted/60 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-primary/70" />
        <span className="size-2.5 rounded-full bg-accent/70" />
        <span className="size-2.5 rounded-full bg-secondary/70" />
        <span className="ml-2 font-mono text-xs font-semibold text-foreground/80">{role.filename}</span>
      </div>
      <span className={cn('rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold', role.badgeClass)}>
        {role.badge}
      </span>
    </div>
  );
}

function FrontmatterRegion({ role, onOpen }: { role: RoleDetail; onOpen: (modal: ModalKey) => void }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Front matter header
        </span>
        <button
          type="button"
          data-card-open="frontmatter"
          onClick={() => onOpen('frontmatter')}
          className="cursor-pointer rounded-lg border border-border bg-card px-2.5 py-1 font-mono text-xs text-muted-foreground shadow-2xs hover:border-secondary hover:text-secondary"
        >
          What is front matter?
        </button>
      </div>
      <pre className="mt-2 font-mono text-xs leading-relaxed text-foreground/80">
        <code>{role.frontmatter}</code>
      </pre>
    </div>
  );
}

function BodyItems({ items }: { items: RoleDetail['items'] }) {
  return (
    <div className="space-y-1.5 pt-1">
      {items.map((it) => (
        <div key={it.id} className="flex items-center gap-2 text-xs text-foreground/90">
          {it.badge && <span className="font-mono font-semibold text-secondary">{it.badge}</span>}
          {it.checked !== undefined && (
            <input type="checkbox" checked={it.checked} disabled className="size-3.5 rounded accent-accent" />
          )}
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function BodyRegion({ role, onOpen }: { role: RoleDetail; onOpen: (modal: ModalKey) => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Document body
        </span>
        <button
          type="button"
          data-card-open="syntax"
          onClick={() => onOpen('syntax')}
          className="cursor-pointer rounded-lg border border-border bg-card px-2.5 py-1 font-mono text-xs text-muted-foreground shadow-2xs hover:border-secondary hover:text-secondary"
        >
          What is the body?
        </button>
      </div>
      <div className="mt-3 space-y-2">
        <h4 className="font-display text-sm font-bold text-foreground"># {role.bodyTitle}</h4>
        <p className="text-xs leading-relaxed text-muted-foreground">{role.bodyDesc}</p>
        <BodyItems items={role.items} />
        <blockquote
          className={cn('mt-3 border-l-2 pl-3 font-mono text-xs italic text-muted-foreground', role.quoteBorder)}
        >
          {role.quote}
        </blockquote>
      </div>
    </div>
  );
}

export function LeftPreviewCard({
  cardRef,
  role,
  onOpen,
}: {
  cardRef: RefObject<HTMLDivElement | null>;
  role: RoleDetail;
  onOpen: (modal: ModalKey) => void;
}) {
  return (
    <div
      ref={cardRef}
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs lg:col-span-7"
    >
      <FileHeader role={role} />
      <div className="flex flex-col gap-4 p-5">
        <FrontmatterRegion role={role} onOpen={onOpen} />
        <BodyRegion role={role} onOpen={onOpen} />
      </div>
    </div>
  );
}
