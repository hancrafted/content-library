/**
 * A rough tokenization heuristic and the session cost it implies, for the tokenizer playground.
 */

export function tokenizeText(text: string): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const tokens: string[] = [];
  for (const word of words) {
    const parts = word.match(/[\p{L}\p{N}]+|[^\p{L}\p{N}]/gu) ?? [word];
    for (const part of parts) {
      if (part.length <= 4) {
        tokens.push(part);
      } else {
        const chunks = part.match(/.{1,4}/g) ?? [part];
        tokens.push(...chunks);
      }
    }
  }
  return tokens;
}

export function calcSessionCost(tokenCount: number, turns = 50, ratePerMillion = 5): number {
  return (tokenCount * turns * ratePerMillion) / 1_000_000;
}
