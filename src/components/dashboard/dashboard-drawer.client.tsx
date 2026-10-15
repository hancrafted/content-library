'use client';

import type { useDashboardDetail } from '@/hooks/use-dashboard-detail';
import type { GraphView } from '@/lib/dashboard-graph-view.pure';
import type { EpisodeOutputs } from '@/lib/dashboard-outputs.pure';
import { X } from 'lucide-react';
import { JobDetail, StageDetail, type OpenEventLog } from './dashboard-detail';
import type { DashboardCopy } from './dashboard-evidence';
import styles from './dashboard-graph.module.css';

interface DrawerProps {
  detail: ReturnType<typeof useDashboardDetail>;
  selection: GraphView['selection'];
  outputs: EpisodeOutputs;
  openLog: OpenEventLog;
  copy: DashboardCopy;
}

function DrawerHead({ detail, copy, title }: Pick<DrawerProps, 'detail' | 'copy'> & { title: string }) {
  return (
    <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border p-4">
      <h2 id="dashboard-detail-title" className="pt-2 text-body font-semibold wrap-anywhere">
        {title}
      </h2>
      <button
        ref={detail.closeButton}
        type="button"
        aria-label={copy.drawer.close}
        onClick={detail.close}
        className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
      >
        <X aria-hidden="true" className="size-5" />
      </button>
    </header>
  );
}

/** The Context drawer's floating-card pattern, without its Episode-specific content or preferences. */
export function DashboardDrawer({ detail, selection, outputs, openLog, copy }: DrawerProps) {
  const title = selection?.title ?? copy.drawer.title;
  return (
    <>
      <div aria-hidden="true" onClick={detail.close} data-open={!!selection} className={styles.drawerScrim} />
      <section
        id="dashboard-stage-detail"
        aria-labelledby="dashboard-detail-title"
        data-dashboard-drawer
        data-open={!!selection}
        className={styles.drawer}
      >
        <DrawerHead detail={detail} copy={copy} title={title} />
        <div ref={detail.body} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          {selection ? (
            selection.job ? (
              <JobDetail node={selection.job} copy={copy} outputs={outputs} openLog={openLog} />
            ) : (
              <StageDetail stage={selection.stage} copy={copy} outputs={outputs} openLog={openLog} />
            )
          ) : null}
        </div>
      </section>
    </>
  );
}
