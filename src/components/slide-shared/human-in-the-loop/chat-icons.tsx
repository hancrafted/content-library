/*
 * Two small marks for the "open in a chat tool" buttons, drawn here because no icon set ships brand marks: an
 * eight-ray burst for Claude and a six-petal rosette for ChatGPT. Decorative: the buttons carry the names.
 */

export function ClaudeMark({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    >
      {[0, 45, 90, 135].map((angle) => (
        <path key={angle} d="M12 3v18" transform={`rotate(${angle} 12 12)`} />
      ))}
    </svg>
  );
}

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
