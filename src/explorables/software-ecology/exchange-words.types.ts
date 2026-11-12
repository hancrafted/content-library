/* The exchange file's words, keyed by the Explorable config pair's `exchange:` (FE-012 §1). */

/** Download YAML, Upload, the drop hint, and the message after either. */
export interface ExchangeWords {
  readonly download: string;
  readonly downloadTip: string;
  readonly upload: string;
  readonly uploadTip: string;
  readonly drop: string;
  readonly downloaded: string;
  readonly unread: string;
  readonly broken: string;
  readonly unstable: string;
  readonly loaded: string;
  /** Appended to `loaded` when rushing or the worst case would overload a work center (Q122). */
  readonly rush: string;
  readonly worst: string;
}
