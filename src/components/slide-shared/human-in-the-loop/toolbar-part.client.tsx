'use client';

import type { ToolbarProps } from './human-in-the-loop.types';
import { WorkflowControls } from './workflow-controls.client';

/** The toolbar part. A stub until the toolbar ticket draws the switches; the picker, upload and download are in. */
export function ToolbarPart(props: ToolbarProps) {
  return (
    <div data-part="toolbar" data-mode={props.mode}>
      <WorkflowControls {...props} />
    </div>
  );
}
