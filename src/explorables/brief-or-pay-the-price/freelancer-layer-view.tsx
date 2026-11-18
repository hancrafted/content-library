import type { FreelancerLayerWords } from './brief-or-pay-the-price.types';

// decision: FE-012 §4.5
export function FreelancerCardView({ words }: { readonly words: FreelancerLayerWords }) {
  return (
    <aside
      data-layer="freelancer"
      className="flex flex-col gap-1 rounded-lg border border-border bg-human/10 p-3 text-caption @3xl:p-4"
    >
      <strong className="font-semibold">{words.title}</strong>
      <span>{words.text}</span>
    </aside>
  );
}

export function TraitShortLineView({ trait, text }: { readonly trait: string; readonly text: string }) {
  return (
    <span data-trait-short={trait} className="hidden text-caption text-muted-foreground @3xl:block">
      {text}
    </span>
  );
}
