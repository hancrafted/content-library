// A `.jsonl` or `.yml` import is the file's text (next.config.ts `turbopack.rules`, raw-text-files.ts for vitest).
declare module '*.jsonl' {
  const text: string;
  export default text;
}

declare module '*.yml' {
  const text: string;
  export default text;
}
