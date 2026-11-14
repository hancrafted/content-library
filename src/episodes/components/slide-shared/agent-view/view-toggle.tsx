import { ViewToggleButtons, type ViewToggleLabels } from './view-toggle.client';

/**
 * The Episode's one Chat app / Coding agent switch (design-ADR 0025, Interaction 1), placed once on the page; every
 * `InView` on the page follows it. The server entry of its client leaf; its words come from the Slide that places it.
 */
export function ViewToggle({ labels, className }: { readonly labels: ViewToggleLabels; readonly className?: string }) {
  return <ViewToggleButtons labels={labels} className={className} />;
}
