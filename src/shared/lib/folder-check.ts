// decision: ARCH-003 §4.7

export type GlobEntries = Readonly<Record<string, () => Promise<unknown>>>;

export interface NamedCheck {
  readonly name: string;
  readonly findings: () => Promise<readonly string[]>;
}
