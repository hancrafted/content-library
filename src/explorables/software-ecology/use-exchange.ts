/*
 * Download YAML and Upload (design-ADR 0024 §11), as the reference build's `wireIo`: Download saves the page's state
 * as one file; Upload, or a file dropped anywhere on the page, is read, checked and handed to `onLoad`, or refused. The
 * message after either, and whether a file is held over the page, are transient (FE-001 §1).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { exchangeName, exportExchange, type PageState } from './exchange-file.pure.ts';
import type { Upload } from './exchange-load.pure.ts';
import { downloadedMessage, uploadMessage, type ExchangeMessage } from './exchange-message.pure.ts';
import type { ExchangeWords } from './exchange-words.types';
import type { Bundle, CatalogWords, Locale } from './software-ecology.types';

export type Loaded = Extract<Upload, { kind: 'loaded' }>;

export interface ExchangeActions {
  readonly message: ExchangeMessage | null;
  /** A file is held over the page: the drop hint shows. */
  readonly dropping: boolean;
  download(): void;
  upload(file: File): void;
}

export interface ExchangeIn {
  readonly words: ExchangeWords;
  readonly catalogs: Readonly<Record<Locale, CatalogWords>>;
  /** The use case on show, its name, and the page state Download saves. */
  readonly current: () => { readonly B: Bundle; readonly name: string; readonly page: PageState };
  readonly onLoad: (up: Loaded) => void;
}

const REVOKE_MS = 1000;

const save = (text: string, file: string) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/yaml' }));
  a.download = file;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), REVOKE_MS);
};

const hasFiles = (e: DragEvent) => [...(e.dataTransfer?.types ?? [])].includes('Files');

/** Files dragged over the page: the hint shows while one is held; a drop hands the file on. */
function useDrop(onFile: (f: File) => void, setDropping: (on: boolean) => void) {
  useEffect(() => {
    let depth = 0;
    const enter = (e: DragEvent) => {
      if (hasFiles(e)) setDropping(++depth > 0);
    };
    const leave = () => {
      depth = Math.max(0, depth - 1);
      if (!depth) setDropping(false);
    };
    const over = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const drop = (e: DragEvent) => {
      const f = e.dataTransfer?.files?.[0];
      if (!f) return;
      e.preventDefault();
      depth = 0;
      setDropping(false);
      onFile(f);
    };
    const on = Object.entries({ dragenter: enter, dragleave: leave, dragover: over, drop }) as [
      string,
      (e: DragEvent) => void,
    ][];
    for (const [k, h] of on) document.addEventListener(k, h as EventListener);
    return () => on.forEach(([k, h]) => document.removeEventListener(k, h as EventListener));
  }, [onFile, setDropping]);
}

export function useExchange(x: ExchangeIn): ExchangeActions {
  const [message, setMessage] = useState<ExchangeMessage | null>(null);
  const [dropping, setDropping] = useState(false);
  const upload = async (f: File) => {
    // the YAML reader and the schema load only when a file arrives
    const [{ uploadExchange }, text] = await Promise.all([import('./exchange-upload.ts'), f.text()]);
    const up = uploadExchange(text, f.name);
    setMessage(uploadMessage(x.words, { file: f.name, up }));
    if (up.kind === 'loaded') x.onLoad(up);
  };
  const onFile = useLatest((f: File) => void upload(f));
  useDrop(onFile, setDropping);
  return {
    message,
    dropping,
    download: () => {
      const { B, name, page } = x.current(),
        file = exchangeName(B);
      save(exportExchange(B, page, x.catalogs), file);
      setMessage(downloadedMessage(x.words, { file, name }));
    },
    upload: onFile,
  };
}

/** A stable function that always calls the latest `fn`, so the document listeners stay put. */
function useLatest<A>(fn: (a: A) => void): (a: A) => void {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  return useCallback((a: A) => ref.current(a), []);
}
