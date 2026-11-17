export function PinNumber({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-caption font-semibold text-background"
    >
      {n}
    </span>
  );
}
