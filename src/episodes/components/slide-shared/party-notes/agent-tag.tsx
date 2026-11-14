/** The tag on a party note an agent works: "Agent" in the meaning colour `ai`, on the note's top-right edge. */
export function AgentTag({ label }: { label: string }) {
  return (
    <span
      data-agent-tag
      className="absolute -top-3 right-3 rounded-full border border-ai bg-card px-2 text-caption text-ai"
    >
      {label}
    </span>
  );
}
