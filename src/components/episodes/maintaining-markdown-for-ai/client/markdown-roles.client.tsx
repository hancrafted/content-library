'use client';

import { externalHref } from '@/lib/external-link.pure';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { ROLES_DATA, type ModalKey, type RoleDetail, type RoleKey } from './markdown-roles-data.pure';
import { MarkdownRolesModal } from './markdown-roles-modal.client';
import { LeftPreviewCard } from './markdown-roles-preview.client';

interface Point {
  readonly x: number;
  readonly y: number;
}

function computeConnector(from: Point, to: Point): string {
  const ax = from.x + 12;
  const bx = Math.max(to.x - 16, ax + 2);
  const span = bx - ax;
  const h = Math.min(span * 0.95, Math.max(span * 0.5, Math.abs(to.y - from.y) * 0.45));
  return `M ${from.x} ${from.y} L ${ax} ${from.y} C ${ax + h} ${from.y}, ${bx - h} ${to.y}, ${bx} ${to.y} L ${to.x} ${to.y}`;
}

function RoleCardTop({ role, onOpen }: { role: RoleDetail; onOpen: (modal: ModalKey) => void }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-bold text-foreground">{role.title}</span>
          <span className={cn('rounded-full border px-2 py-0.5 font-mono text-[10px]', role.badgeClass)}>
            {role.badge}
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{role.costNote}</p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpen(role.key);
        }}
        className="cursor-pointer rounded-lg border border-border bg-card px-2 py-1 font-mono text-[11px] text-muted-foreground shadow-2xs hover:border-secondary hover:text-secondary"
      >
        Show details
      </button>
    </div>
  );
}

function RoleCardFooter({ source, url }: { source: string; url: string }) {
  return (
    <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[11px]">
      <a
        href={externalHref(url)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="font-mono text-xs font-semibold text-primary hover:underline"
      >
        {source}
      </a>
      <span className="text-muted-foreground">↗</span>
    </div>
  );
}

function RoleCard({
  id,
  role,
  isActive,
  onSelect,
  onOpen,
}: {
  id?: string;
  role: RoleDetail;
  isActive: boolean;
  onSelect: () => void;
  onOpen: (modal: ModalKey) => void;
}) {
  return (
    <div
      id={id}
      onClick={onSelect}
      className={cn(
        'cursor-pointer rounded-2xl border bg-card/90 p-4 shadow-xs transition-all hover:border-foreground/30',
        isActive ? 'ring-2 ring-primary border-primary' : 'border-border',
      )}
    >
      <RoleCardTop role={role} onOpen={onOpen} />
      <RoleCardFooter source={role.source} url={role.sourceUrl} />
    </div>
  );
}

function SvgConnectors({ paths, activeRole }: { paths: Record<RoleKey, string>; activeRole: RoleKey }) {
  return (
    <svg
      className="s2-arrows-active pointer-events-none absolute inset-0 hidden size-full overflow-visible lg:block"
      aria-hidden="true"
    >
      {(['knowledge', 'instruction', 'memory'] as const).map((key) => {
        const d = paths[key];
        const isActive = activeRole === key;
        const color =
          key === 'knowledge'
            ? 'var(--color-accent)'
            : key === 'instruction'
              ? 'var(--color-secondary)'
              : 'var(--color-primary)';
        return (
          <g key={key} className={cn('s2-arrow-group', isActive ? 'is-active opacity-100' : 'is-inactive opacity-30')}>
            {d && <path d={d} stroke={color} strokeWidth="2" fill="none" opacity="0.6" />}
            {d && <path d={d} stroke={color} fill="none" className="s2-flow-dash" />}
          </g>
        );
      })}
    </svg>
  );
}

function measurePaths(
  root: HTMLDivElement,
  left: HTMLDivElement,
  rights: Record<RoleKey, HTMLDivElement | null>,
): Record<RoleKey, string> {
  const rootRect = root.getBoundingClientRect();
  const leftRect = left.getBoundingClientRect();
  const from: Point = { x: leftRect.right - rootRect.left, y: leftRect.top + leftRect.height / 2 - rootRect.top };

  const next: Record<RoleKey, string> = { knowledge: '', instruction: '', memory: '' };
  (['knowledge', 'instruction', 'memory'] as const).forEach((key) => {
    const el = rights[key];
    if (!el) return;
    const r = el.getBoundingClientRect();
    const to: Point = { x: r.left - rootRect.left, y: r.top + r.height / 2 - rootRect.top };
    next[key] = computeConnector(from, to);
  });
  return next;
}

function useConnectorPaths(
  rootRef: RefObject<HTMLDivElement | null>,
  leftRef: RefObject<HTMLDivElement | null>,
  rightRefs: RefObject<Record<RoleKey, HTMLDivElement | null>>,
) {
  const [paths, setPaths] = useState<Record<RoleKey, string>>({ knowledge: '', instruction: '', memory: '' });

  const update = useCallback(() => {
    if (!rootRef.current || !leftRef.current) return;
    setPaths(measurePaths(rootRef.current, leftRef.current, rightRefs.current));
  }, [rootRef, leftRef, rightRefs]);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  return { paths, update };
}

interface RightCardsProps {
  readonly rightRefs: RefObject<Record<RoleKey, HTMLDivElement | null>>;
  readonly activeRole: RoleKey;
  readonly knowledgeId?: string;
  readonly onSelect: (key: RoleKey) => void;
  readonly onOpen: (modal: ModalKey) => void;
}

const ROLE_KEYS: readonly RoleKey[] = ['knowledge', 'instruction', 'memory'];
const INIT_REFS: Record<RoleKey, HTMLDivElement | null> = { knowledge: null, instruction: null, memory: null };

function RightRoleCards({ rightRefs, activeRole, knowledgeId, onSelect, onOpen }: RightCardsProps) {
  return (
    <div className="flex flex-col justify-between gap-4 lg:col-span-5">
      {ROLE_KEYS.map((key) => (
        <div
          key={key}
          ref={(el) => {
            rightRefs.current[key] = el;
          }}
        >
          <RoleCard
            id={key === 'knowledge' ? knowledgeId : undefined}
            role={ROLES_DATA[key]}
            isActive={activeRole === key}
            onSelect={() => onSelect(key)}
            onOpen={onOpen}
          />
        </div>
      ))}
    </div>
  );
}

function useInteractiveRoles() {
  const [activeRole, setActiveRole] = useState<RoleKey>('knowledge');
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightRefs = useRef<Record<RoleKey, HTMLDivElement | null>>({ ...INIT_REFS });
  const { paths, update } = useConnectorPaths(containerRef, leftCardRef, rightRefs);

  const onSelectRole = useCallback(
    (key: RoleKey) => {
      setActiveRole(key);
      update();
    },
    [update],
  );

  return { activeRole, activeModal, setActiveModal, containerRef, leftCardRef, rightRefs, paths, onSelectRole };
}

export function MarkdownRolesInteractive({ knowledgeId }: { knowledgeId?: string }) {
  const s = useInteractiveRoles();
  const closeModal = useCallback(() => s.setActiveModal(null), [s]);

  return (
    <div ref={s.containerRef} className="relative mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12">
      <SvgConnectors paths={s.paths} activeRole={s.activeRole} />
      <LeftPreviewCard cardRef={s.leftCardRef} role={ROLES_DATA[s.activeRole]} onOpen={s.setActiveModal} />
      <RightRoleCards
        rightRefs={s.rightRefs}
        activeRole={s.activeRole}
        knowledgeId={knowledgeId}
        onSelect={s.onSelectRole}
        onOpen={s.setActiveModal}
      />
      <MarkdownRolesModal modal={s.activeModal} onClose={closeModal} />
    </div>
  );
}
