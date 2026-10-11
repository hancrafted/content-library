'use client';

import { type ReactElement } from 'react';
import styles from './claude-context-terminal.module.css';

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
  S: { glyph: '⛁', className: 'text-(--info)' },
  T: { glyph: '⛁', className: 'text-background' },
  M: { glyph: '⛁', className: 'text-background/70' },
  A: { glyph: '⛀', className: 'text-(--term-agent)/70' },
  K: { glyph: '⛁', className: 'text-(--term-error)' },
  G: { glyph: '⛁', className: 'text-(--warning)' },
  E: { glyph: '⛶', className: 'text-background/25' },
  B: { glyph: '⛝', className: 'text-(--warning)/60' },
};

const CATEGORIES = [
  { icon: '⛁', color: 'text-(--info)', label: 'System prompt', value: '9.4k · 4.7%' },
  { icon: '⛁', color: 'text-background', label: 'System tools', value: '42.9k · 21.5%' },
  { icon: '⛁', color: 'text-background/70', label: 'MCP tools', value: '3.9k · 2.0%' },
  { icon: '⛁', color: 'text-(--term-agent)', label: 'Custom agents', value: '703 · 0.4%' },
  { icon: '⛁', color: 'text-(--success)', label: 'Memory files', value: '407 · 0.2%' },
  { icon: '⛁', color: 'text-(--term-error)', label: 'Skills', value: '2.2k · 1.1%' },
  { icon: '⛁', color: 'text-(--warning)', label: 'Messages', value: '20.0k · 10.0%' },
  { icon: '⛶', color: 'text-background/30', label: 'Free space', value: '87.5k · 43.7%' },
  { icon: '⛝', color: 'text-(--warning)', label: 'Autocompact buffer', value: '33k · 16.5%' },
] as const;

function TerminalHeader(): ReactElement {
  return (
    <div className="flex items-center gap-1.5 border-b border-background/10 px-4 py-3">
      <span className="h-3 w-3 rounded-full bg-(--term-error)/70" />
      <span className="h-3 w-3 rounded-full bg-(--warning)/70" />
      <span className="h-3 w-3 rounded-full bg-(--success)/70" />
      <span className="ml-3 font-mono text-xs text-background/50">claude-code — /context</span>
    </div>
  );
}

function GridReadout(): ReactElement {
  return (
    <div className="min-w-0 text-sm">
      <div className="mb-4">
        <div className="font-bold text-background">Sonnet 5</div>
        <div className="text-background/50">claude-sonnet-5</div>
        <div className="mt-1">
          <span className="font-bold tabular-nums text-primary">79.5k</span>
          <span className="text-background/60">/200k tokens (</span>
          <span className="font-bold tabular-nums text-primary">40</span>
          <span className="text-background/60">%)</span>
        </div>
      </div>
      <div className="mb-2 text-[0.65rem] uppercase tracking-widest text-background/50">
        Estimated usage by category
      </div>
      <ul className="space-y-1">
        {CATEGORIES.map((cat) => (
          <li key={cat.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span className={cat.color}>{cat.icon}</span>
              <span className="text-background/90">{cat.label}</span>
            </span>
            <span className="tabular-nums text-background/70">{cat.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClaudeContextTerminalClient(): ReactElement {
  return (
    <div
      className={`${styles.scene} overflow-hidden rounded-xl border border-foreground bg-foreground text-background shadow-lg`}
    >
      <TerminalHeader />
      <div className="p-6 font-mono">
        <div className="mb-5 text-sm text-(--success)">$ /context</div>
        <div className="grid gap-8 md:grid-cols-[auto_1fr]">
          <div className="grid grid-cols-10 gap-1 text-lg leading-none select-none" aria-hidden="true">
            {PATTERN.split('').map((ch, idx) => {
              const meta = GLYPH_MAP[ch] ?? { glyph: '·', className: 'text-background/20' };
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
