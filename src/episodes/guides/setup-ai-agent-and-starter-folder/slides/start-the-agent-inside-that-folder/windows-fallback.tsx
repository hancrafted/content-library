import { CopyLine } from '@/episodes/components/slide-shared/agent-setup-step/copy-line.client';
import { MoreHelp } from '@/episodes/components/slide-shared/guide-step/guide-step';
import type { ReactNode } from 'react';

interface WindowsFallbackProps {
  readonly shell: ReactNode;
  readonly copyWords: { copy: string; copied: string };
  readonly words: {
    title: string;
    open: ReactNode;
    addressBar: string;
    shellHint: string;
    check: string;
    location: string;
    file: ReactNode;
    fallback: ReactNode;
    alternate: ReactNode;
  };
}

export function WindowsFallback({ shell, words, copyWords }: WindowsFallbackProps) {
  return (
    <MoreHelp title={words.title}>
      <div className="flex flex-col gap-3 text-body" data-folder-fallback="">
        <p>{words.open}</p>
        <div className="flex flex-col gap-3 rounded-lg bg-muted p-4">
          <p className="text-caption font-semibold">{words.addressBar}</p>
          <div className="flex items-center justify-between gap-3 rounded border border-border bg-background p-3">
            <code data-explorer-shell="">{shell}</code>
            <kbd className="rounded border border-border px-2 text-caption">Enter</kbd>
          </div>
          <p className="text-caption text-muted-foreground">{words.shellHint}</p>
        </div>
        <div className="flex flex-col gap-3" data-folder-check="">
          <p className="font-semibold">{words.check}</p>
          <CopyLine text="Get-Location" where="shell" words={copyWords} />
          <p className="text-caption text-muted-foreground">{words.location}</p>
          <CopyLine text={"Get-Content -LiteralPath '.\\GLOSSARY.md' -TotalCount 3"} where="shell" words={copyWords} />
          <p className="text-caption text-muted-foreground">{words.file}</p>
        </div>
        <p className="text-caption text-muted-foreground">{words.fallback}</p>
        <p className="text-caption text-muted-foreground">{words.alternate}</p>
      </div>
    </MoreHelp>
  );
}
