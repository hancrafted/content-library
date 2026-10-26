/*
 * A small mark for the "open in a chat tool" buttons, drawn here because no icon set ships brand marks: a
 * six-petal rosette for ChatGPT. Decorative: the buttons carry the names.
 */

export function ChatGptMark({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    >
      {[0, 60, 120].map((angle) => (
        <rect key={angle} x="8.2" y="2.6" width="7.6" height="18.8" rx="3.8" transform={`rotate(${angle} 12 12)`} />
      ))}
    </svg>
  );
}
