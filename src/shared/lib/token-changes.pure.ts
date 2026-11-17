import type { Theme, Token } from './token-discovery.pure';

export type Scope = { kind: 'global' } | { kind: 'slide'; id: string; folder: string | null };

export interface Change {
  scope: Scope;
  theme: Theme;
  name: string;
  target?: string;
  from: string;
  to: string;
}

export type Edits = Record<string, string>;

function scopeKey(scope: Scope): string {
  return scope.kind === 'global' ? 'global' : `slide:${scope.id}`;
}

export function editKey(scope: Scope, theme: Theme, token: Pick<Token, 'name' | 'target'>): string {
  return `${scopeKey(scope)}|${theme}|${token.name}|${token.target ?? ''}`;
}

export interface EditRef {
  scope: Scope;
  theme: Theme;
  token: Token;
}

export function setEdit(edits: Edits, { scope, theme, token }: EditRef, value: string): Edits {
  const key = editKey(scope, theme, token);
  const rest = Object.fromEntries(Object.entries(edits).filter(([k]) => k !== key));
  return value === token[theme] ? rest : { ...rest, [key]: value };
}

export function diffTokens(scope: Scope, tokens: readonly Token[], edits: Edits): Change[] {
  return (['light', 'dark'] as const).flatMap((theme) =>
    tokens.flatMap((token) => {
      const to = edits[editKey(scope, theme, token)];
      return to === undefined || to === token[theme]
        ? []
        : [
            {
              scope,
              theme,
              name: token.name,
              ...(token.target ? { target: token.target } : {}),
              from: token[theme],
              to,
            },
          ];
    }),
  );
}
