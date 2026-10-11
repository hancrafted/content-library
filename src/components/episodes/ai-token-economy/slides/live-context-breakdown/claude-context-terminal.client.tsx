'use client';

import { type ReactElement } from 'react';

const PATTERN = [
  'SSSSSTTTTT',
  'TTTTTTTTTT',
  'TTTTTTMMKA',
  'GGGGGGGGGG',
  'EEEEEEEEEE',
  'EEEEEEEEEE',
  'EEEEEEEEEE',
  'EEEEEEEEEE',
  'EEEBBBBBBB',
  'BBBBBBBBBB',
].join('');

const GLYPH_MAP: Record<string, { glyph: string; className: string }> = {
  S: { glyph: '⛁', className: 'text-info' },
  T: { glyph: '⛁', className: 'text-primary' },
  M: { glyph: '⛁', className: 'text-accent' },
  A: { glyph: '⛀', className: 'text-secondary/70' },
  K: { glyph: '⛁', className: 'text-error' },
  G: { glyph: '⛁', className: 'text-warning' },
  E: { glyph: '⛶', className: 'text-neutral-content/25' },
  B: { glyph: '⛝', className: 'text-warning/60' },
};

const CATEGORIES = [
  { icon: '⛁', color: 'text-info', label: 'System prompt', value: '9.4k · 4.7%' },
  { icon: '⛁', color: 'text-primary', label: 'System tools', value: '42.9k · 21.5%' },
  { icon: '⛁', color: 'text-accent', label: 'MCP tools', value: '3.9k · 2.0%' },
  { icon: '⛁', color: 'text-secondary', label: 'Custom agents', value: '703 · 0.4%' },
  { icon: '⛁', color: 'text-success', label: 'Memory files', value: '407 · 0.2%' },
  { icon: '⛁', color: 'text-error', label: 'Skills', value: '2.2k · 1.1%' },
  { icon: '⛁', color: 'text-warning', label: 'Messages', value: '20.0k · 10.0%' },
  { icon: '⛶', color: 'text-neutral-content/30', label: 'Free space', value: '87.5k · 43.7%' },
  { icon: '⛝', color: 'text-warning', label: 'Autocompact buffer', value: '33k · 16.5%' },
] as const;

function TerminalHeader(): ReactElement {
  return (
    <div className="flex items-center gap-1.5 border-b border-neutral-content/10 px-4 py-3">
      <span className="h-3 w-3 rounded-full bg-error/70" />
      <span className="h-3 w-3 rounded-full bg-warning/70" />
      <span className="h-3 w-3 rounded-full bg-success/70" />
      <span className="ml-3 font-mono text-xs text-neutral-content/50">claude-code — /context</span>
    </div>
  );
}

function GridReadout(): ReactElement {
  return (
    <div className="min-w-0 text-sm">
      <div className="mb-4">
        <div className="font-bold text-neutral-content">Sonnet 5</div>
        <div className="text-neutral-content/50">claude-sonnet-5</div>
        <div className="mt-1">
          <span className="font-bold tabular-nums text-primary">79.5k</span>
          <span className="text-neutral-content/60">/200k tokens (</span>
          <span className="font-bold tabular-nums text-primary">40</span>
          <span className="text-neutral-content/60">%)</span>
        </div>
      </div>
      <div className="mb-2 text-[0.65rem] uppercase tracking-widest text-neutral-content/50">
        Estimated usage by category
      </div>
      <ul className="space-y-1">
        {CATEGORIES.map((cat) => (
          <li key={cat.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span className={cat.color}>{cat.icon}</span>
              <span className="text-neutral-content/90">{cat.label}</span>
            </span>
            <span className="tabular-nums text-neutral-content/70">{cat.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClaudeContextTerminalClient(): ReactElement {
  return (
    <div className="overflow-hidden rounded-box border border-neutral bg-neutral text-neutral-content shadow-lg">
      <TerminalHeader />
      <div className="p-6 font-mono">
        <div className="mb-5 text-sm text-success">$ /context</div>
        <div className="grid gap-8 md:grid-cols-[auto_1fr]">
          <div className="grid grid-cols-10 gap-1 text-lg leading-none select-none" aria-hidden="true">
            {PATTERN.split('').map((ch, idx) => {
              const meta = GLYPH_MAP[ch] ?? { glyph: '·', className: 'text-neutral-content/20' };
              return (
                <span key={idx} className={meta.className}>
                  {meta.glyph}
                </span>
              );
            })}
          </div>
          <GridReadout />
        </div>
      </div>
    </div>
  );
}
