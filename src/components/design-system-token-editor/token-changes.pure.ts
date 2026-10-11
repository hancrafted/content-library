import type { Theme, Token } from './token-discovery.pure';

/** Where a token lives: the whole site, or one Slide. */
export type Scope = { kind: 'global' } | { kind: 'slide'; id: string; episode: string | null };

export interface Change {
  scope: Scope;
  theme: Theme;
  name: string;
  from: string;
  to: string;
}

/** Edits keyed by scope, theme and token name. */
export type Edits = Record<string, string>;

function scopeKey(scope: Scope): string {
  return scope.kind === 'global' ? 'global' : `slide:${scope.id}`;
}

export function editKey(scope: Scope, theme: Theme, name: string): string {
  return `${scopeKey(scope)}|${theme}|${name}`;
}

/** Which value of which token an edit addresses. */
export interface EditRef {
  scope: Scope;
  theme: Theme;
  token: Token;
}

/** Records an edit; typing the original value back removes it. */
export function setEdit(edits: Edits, { scope, theme, token }: EditRef, value: string): Edits {
  const key = editKey(scope, theme, token.name);
  const rest = Object.fromEntries(Object.entries(edits).filter(([k]) => k !== key));
  return value === token[theme] ? rest : { ...rest, [key]: value };
}

/** Exactly the tokens whose edited value differs from the declared one. */
export function diffTokens(scope: Scope, tokens: readonly Token[], edits: Edits): Change[] {
  return (['light', 'dark'] as const).flatMap((theme) =>
    tokens.flatMap((token) => {
      const to = edits[editKey(scope, theme, token.name)];
      return to === undefined || to === token[theme]
        ? []
        : [{ scope, theme, name: token.name, from: token[theme], to }];
    }),
  );
}
