'use client';

import { externalHref } from '@/lib/external-link.pure';
import { useEffect } from 'react';
import { MODALS_DATA, type ModalContent, type ModalKey } from './markdown-roles-data.pure';

const CHEATSHEET_ROWS = [
  { raw: '# Heading 1\n## Heading 2\n###### Heading 6', label: 'Headings 1 through 6' },
  { raw: '**bold** and *italic* and `code`', label: 'Inline typography & styling' },
  { raw: '[Handbook](https://example.com)', label: 'Hyperlinks' },
  { raw: '- item 1\n  - nested\n1. ordered', label: 'Unordered & ordered lists' },
  { raw: '- [x] reviewed\n- [ ] pending', label: 'Task lists / checkboxes' },
  { raw: '> Writing got cheap. Verifying did not.', label: 'Blockquotes' },
  { raw: '```bash\nnpm run verify\n```', label: 'Fenced code blocks' },
  { raw: '| File | Owner |\n| --- | --- |', label: 'Tables' },
];

function CodePanel({ filename, code }: { filename: string; code: string }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-muted/40">
      <figcaption className="flex items-center gap-2 border-b border-border bg-muted/70 px-3 py-2">
        <span className="size-2 rounded-full bg-primary/60" />
        <span className="size-2 rounded-full bg-accent/60" />
        <span className="font-mono text-xs font-semibold text-muted-foreground">{filename}</span>
      </figcaption>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground/90">
        <code>{code}</code>
      </pre>
    </figure>
  );
}

function SyntaxCheatsheet() {
  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 divide-y divide-border rounded-xl border border-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
        <div className="p-4 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Raw Markdown
        </div>
        <div className="p-4 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Element Type
        </div>
      </div>
      <div className="divide-y divide-border rounded-xl border border-border">
        {CHEATSHEET_ROWS.map((row) => (
          <div key={row.label} className="grid grid-cols-1 gap-2 p-3 text-xs sm:grid-cols-2 sm:gap-4">
            <pre className="font-mono text-xs text-muted-foreground">{row.raw}</pre>
            <div className="font-medium text-foreground">{row.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-1 text-xs text-foreground/80">{value}</p>
    </div>
  );
}

function RoleMetrics({ data }: { data: ModalContent }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {data.reads && <MetricCard title="When read" value={data.reads} />}
      {data.costs && <MetricCard title="Cost" value={data.costs} />}
      {data.breaks && <MetricCard title="Breaks when" value={data.breaks} />}
      {data.credibility && <MetricCard title="Standard / Citation" value={data.credibility} />}
    </div>
  );
}

function ModalHeader({ data, onClose }: { data: ModalContent; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {data.eyebrow}
        </p>
        <h3 className="mt-1 font-display text-lg font-bold text-foreground sm:text-xl">{data.title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">{data.lede}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="cursor-pointer rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Close modal"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function ModalContentBody({ modal, data }: { modal: ModalKey; data: ModalContent }) {
  return (
    <div className="mt-6 space-y-6">
      {modal === 'syntax' ? <SyntaxCheatsheet /> : <RoleMetrics data={data} />}
      {data.filename && data.sourceExcerpt && <CodePanel filename={data.filename} code={data.sourceExcerpt} />}
      {data.linkUrl && (
        <div className="border-t border-border pt-4">
          <a
            href={externalHref(data.linkUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs font-semibold text-primary hover:underline"
          >
            {data.linkText ?? data.linkUrl}
          </a>
        </div>
      )}
    </div>
  );
}

export function MarkdownRolesModal({ modal, onClose }: { modal: ModalKey | null; onClose: () => void }) {
  useEffect(() => {
    if (!modal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal, onClose]);

  if (!modal) return null;
  const data = MODALS_DATA[modal];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader data={data} onClose={onClose} />
        <ModalContentBody modal={modal} data={data} />
      </div>
    </div>
  );
}
