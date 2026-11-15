/** The speed card: every card done in the new time, the old time struck, and what the speed buys; the one `primary` fill. */
export function SpeedCard({
  label,
  value,
  before,
  claim,
}: {
  label: string;
  value: string;
  before: string;
  claim: string;
}) {
  return (
    <div
      data-speed-card
      className="flex -rotate-1 flex-col gap-1 rounded-sm bg-primary p-5 text-primary-foreground shadow-xl"
    >
      <p className="text-caption font-medium uppercase">{label}</p>
      <p className="text-subheading font-semibold tabular-nums">{value}</p>
      <p className="text-caption">
        <s>{before}</s> · {claim}
      </p>
    </div>
  );
}
