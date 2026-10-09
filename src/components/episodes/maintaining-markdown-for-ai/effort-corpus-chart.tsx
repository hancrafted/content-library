import { cn } from '@/lib/utils';

function CorpusAxesLabels() {
  return (
    <>
      <text x="76" y="38" className="fill-muted-foreground font-mono text-[11px] uppercase tracking-widest">
        Maintenance surface
      </text>
      <text
        x="238"
        y="344"
        textAnchor="middle"
        className="fill-muted-foreground font-mono text-[11px] uppercase tracking-widest"
      >
        number of files
      </text>
    </>
  );
}

function CorpusAxes() {
  return (
    <g>
      <g className="text-muted-foreground/50">
        <line
          x1="76"
          y1="300"
          x2="76"
          y2="52"
          stroke="currentColor"
          strokeWidth="1.5"
          markerEnd="url(#corpus-axis-arrow)"
        />
        <line x1="68" y1="300" x2="410" y2="300" stroke="currentColor" strokeWidth="1.5" />
      </g>
      <CorpusAxesLabels />
      <path
        d="M 76 288 C 108 272, 170 238, 238 200 C 292 170, 346 110, 400 50 L 400 160 C 292 203, 184 245, 76 288 Z"
        className="fill-secondary/15"
      />
    </g>
  );
}

function CorpusLegend() {
  return (
    <>
      <line x1="408" y1="50" x2="424" y2="50" className="stroke-secondary" strokeWidth="3" strokeLinecap="round" />
      <text x="432" y="47" className="fill-foreground text-[11px] font-semibold">
        Maintenance surface
      </text>
      <text x="432" y="62" className="fill-muted-foreground text-[11px]">
        superlinear growth
      </text>
      <line x1="408" y1="160" x2="424" y2="160" className="stroke-accent" strokeWidth="3" strokeLinecap="round" />
      <text x="432" y="157" className="fill-foreground text-[11px] font-semibold">
        File count
      </text>
      <text x="432" y="172" className="fill-muted-foreground text-[11px]">
        linear growth
      </text>
    </>
  );
}

function CorpusCurves() {
  return (
    <g>
      <path
        d="M 76 288 C 184 245, 292 203, 400 160"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-accent"
      />
      <path
        d="M 76 288 C 108 272, 170 238, 238 200 C 292 170, 346 110, 400 50"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-secondary"
      />
      <CorpusLegend />
    </g>
  );
}

export function EffortCorpusChart({ className, id }: { className?: string; id?: string }) {
  return (
    <div id={id} className="relative">
      <svg
        viewBox="0 0 560 360"
        role="img"
        aria-label="Maintenance surface plotted against corpus size."
        className={cn('mx-auto block h-auto max-h-[40vh] w-full', className)}
      >
        <defs>
          <marker
            id="corpus-axis-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 1 2 L 7 5 L 1 8 z" fill="currentColor" className="text-muted-foreground/60" />
          </marker>
        </defs>
        <CorpusAxes />
        <CorpusCurves />
      </svg>
    </div>
  );
}
