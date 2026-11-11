import { BikeBench } from '@/episodes/components/slide-shared/bike-bench/bike-bench';

/** The clean bench the spec lands on: the bike bench with nothing lit but the bench and its work order. */
export function BenchStrip({ label, drawing }: { label: string; drawing: string }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <BikeBench label={drawing} highlight={['bench', 'work-order']} />
      <p className="text-center text-caption text-muted-foreground">{label}</p>
    </div>
  );
}
