import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import styles from './what-is-a-sales-pipeline.module.css';

type Row = readonly [string, string, string];

const CELL = 'border border-border px-2 py-1 text-left';

/** Actionable 4 drawn so the viewer can copy it: a stage, a first-contact date and a closed date per deal. */
export function PipelineSheet({ title, columns, rows }: { title: string; columns: Row; rows: readonly Row[] }) {
  return (
    <div className="mt-12">
      <h4 className="text-body font-semibold">{title}</h4>
      <table className="mt-3 w-full max-w-xl table-fixed border-collapse text-caption">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className={cn(CELL, 'bg-muted font-medium text-foreground')}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row[0]} style={{ '--row': index } as CSSProperties} className={styles.row}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={cn(CELL, 'text-muted-foreground')}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
