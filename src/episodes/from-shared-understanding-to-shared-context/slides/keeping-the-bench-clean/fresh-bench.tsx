import type { ReactNode } from 'react';

export interface FreshBenchProps {
  readonly label: string;
  readonly text: string;
  readonly old: { readonly caption: string; readonly bars: ReactNode };
  readonly fresh: { readonly caption: string; readonly bars: ReactNode };
}

export function FreshBench({ label, text, old, fresh }: FreshBenchProps) {
  return (
    <div className="grid items-center gap-6 rounded-xl bg-foreground p-5 text-background @3xl:grid-cols-12">
      <div className="@3xl:col-span-6">
        <p className="text-caption uppercase opacity-70">{label}</p>
        <p className="text-body font-semibold">{text}</p>
      </div>
      <div className="flex flex-col gap-3 @3xl:col-span-6">
        {[old, fresh].map(({ caption, bars }) => (
          <div key={caption} className="flex flex-col gap-1">
            <p className="text-caption opacity-70">{caption}</p>
            <div className="rounded-md bg-card p-3 text-foreground">{bars}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
