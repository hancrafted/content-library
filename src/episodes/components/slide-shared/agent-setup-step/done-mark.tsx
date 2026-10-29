/** The success tick a step shows beside "it worked", in the `success` colour. */
export function DoneMark() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 shrink-0" aria-hidden="true">
      <path
        d="M3 8.5 6.5 12 13 4.5"
        className="fill-none stroke-(--success)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
