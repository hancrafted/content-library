import type { TargetProps } from '@/components/slide-master/episode-record';
import { cn } from '@/lib/utils';

interface SchemaRow {
  line: number;
  field: string;
  comment: string;
  isHeader?: boolean;
  required?: boolean;
}

const OKF_ROWS: SchemaRow[] = [
  { line: 1, field: '---', comment: '' },
  { line: 2, field: '# --- Provenance (§5.1) ---', comment: '', isHeader: true },
  { line: 3, field: 'title: <Concept name>', comment: '# REQUIRED — Human-readable concept title', required: true },
  { line: 4, field: 'version: 0.2.0', comment: '# SemVer concept version' },
  { line: 5, field: 'description: <Summary>', comment: '# Summary statement for agent indexing' },
  { line: 6, field: 'tags: [onboarding, ops]', comment: '# Categorical indexing keys' },
  { line: 7, field: 'sources:', comment: '# Optional — materials this concept derives from' },
  { line: 8, field: '  - id: <citation-key>', comment: '# Stable citation key for claim attribution' },
  { line: 9, field: '    resource: <URI>', comment: '# REQUIRED within entry — URI or path', required: true },
  { line: 10, field: '# --- Trust (§5.2, §5.3) ---', comment: '', isHeader: true },
  { line: 11, field: 'generated:', comment: '# Content production record' },
  { line: 12, field: '  by: <Actor>', comment: '# REQUIRED within generated — agent or human', required: true },
  { line: 13, field: '  at: <ISO 8601>', comment: '# Timestamp of generation' },
  { line: 14, field: 'verified:', comment: '# Content verification event log' },
  { line: 15, field: '  - by: <Actor>', comment: '# REQUIRED — reviewer who sets trust tier', required: true },
  { line: 16, field: '    at: <ISO 8601>', comment: '# Timestamp of verification' },
  { line: 17, field: '# --- Lifecycle (§5.4) ---', comment: '', isHeader: true },
  { line: 18, field: 'stale_after: <ISO 8601>', comment: '# Temporal expiration date' },
  { line: 19, field: 'owner: "@people-ops"', comment: '# Accountable team or user' },
  { line: 20, field: '---', comment: '' },
];

function OkfTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
      <table className="w-full font-mono text-xs">
        <tbody>
          {OKF_ROWS.map((row) => (
            <tr key={row.line} className="hover:bg-muted/40 transition-colors">
              <td className="w-10 select-none py-1.5 pl-4 pr-3 text-right text-muted-foreground/40">{row.line}</td>
              <td
                className={cn(
                  'py-1.5 pr-6 whitespace-pre font-medium',
                  row.isHeader ? 'text-primary font-bold pt-3 pb-1' : 'text-foreground/90',
                )}
              >
                {row.field}
              </td>
              <td className="py-1.5 pr-4 text-muted-foreground whitespace-nowrap">{row.comment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OkfSpecLink() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary font-mono text-xs font-bold text-primary-foreground">
          OKF
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Official Open Knowledge Format Specification (v0.2)</p>
          <p className="text-xs text-muted-foreground">
            Open specification by Google Cloud Platform for agent-maintained knowledge repositories.
          </p>
        </div>
      </div>
      <a
        href="https://github.com/GoogleCloudPlatform/open-knowledge-format"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
      >
        Read SPEC.md on GitHub ↗
      </a>
    </div>
  );
}

export function OkfSchema(target: TargetProps) {
  return (
    <div {...target} className="mt-8 space-y-4">
      <OkfTable />
      <OkfSpecLink />
    </div>
  );
}
