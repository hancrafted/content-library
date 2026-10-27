'use client';

import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { Download, FileDown, FileUp, Upload } from 'lucide-react';
import { useId, type ChangeEvent, type ReactNode } from 'react';
import { DebugToggle } from './debug-toggle.client';
import { DemoToggle, Reset, ResetConfirm, useDemoProps } from './demo-controls.client';
import { LevelControl } from './level-control.client';
import type { ToolbarProps } from './part-props.types';
import { ProgressNote } from './progress-note.client';
import { saveFile } from './save-file';
import { TOOLBAR_PILL, TOOLBAR_ROW, ToolButton } from './tool-button.client';
import { offers, type ControlId } from './toolbar-controls.pure';
import { hasPicker, Picker } from './use-case-picker.client';
import { ViewControl } from './view-control.client';
import { workflowFile } from './workflow-file.pure';

/*
 * The one pill toolbar, as the context window's: the use case picker ("Use case: <Workflow>", a shadcn select whose
 * options carry a muted description), a separator, then the controls in order: view (Stages · Jobs), the `</>` CLI
 * toggle, the Demo mode switch, the Debug toggle where it is available, save and load progress, download and upload of
 * the Workflow file, each icon with a tooltip. Save progress and Reset show once the run has work; Load always does.
 * Reset sits apart after the pill, as in the popover. The control registry says what shows; a readonly Preset also
 * drops the `</>` toggle, Demo mode, Debug and Reset. Under the pill sit Reset's confirmation and the notes. The parent
 * validates an upload; this part only reads the chosen file.
 */

const UPLOAD_BUTTON = 'relative size-9 rounded-full focus-within:ring-[3px] focus-within:ring-ring/50';

interface FileButtonProps {
  readonly control: string;
  readonly label: string;
  readonly describedBy?: string;
  readonly onText: (text: string) => void;
  readonly children: ReactNode;
}

/** An icon button that opens the file chooser and hands the text of the chosen file on. */
function FileButton({ control, label, describedBy, onText, children }: FileButtonProps) {
  const readChosenFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onText(await file.text());
    event.target.value = '';
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant="ghost" size="icon" className={UPLOAD_BUTTON}>
          <label data-control={control}>
            {children}
            <input
              type="file"
              accept=".yml,.yaml,application/x-yaml,text/yaml"
              aria-label={label}
              aria-describedby={describedBy}
              onChange={readChosenFile}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
          </label>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function Problems({ id, problems }: { readonly id: string; readonly problems: readonly string[] }) {
  return (
    <ul id={id} role="alert" data-upload-problems="" className="mb-3 list-disc pl-5 text-body text-destructive">
      {problems.map((problem) => (
        <li key={problem}>{problem}</li>
      ))}
    </ul>
  );
}

/**
 * The progress file's save and load: the run of an authored Workflow only, so none while an uploaded one is shown.
 * Save waits for work to save, as Reset does; Load always shows, so a new device can restore a run.
 */
function ProgressIcons({ bar, describedBy }: { readonly bar: ToolbarProps; readonly describedBy?: string }) {
  const { controls, words, progress } = bar;
  if (!progress) return null;
  return (
    <>
      {offers(controls, 'progressDownload', bar.readonly) && bar.canSave && (
        <ToolButton
          label={words.progressSave}
          data-control="progressDownload"
          variant="ghost"
          onClick={progress.onDownload}
        >
          <FileDown aria-hidden="true" />
        </ToolButton>
      )}
      {offers(controls, 'progressUpload', bar.readonly) && (
        <FileButton
          control="progressUpload"
          label={words.progressLoad}
          describedBy={describedBy}
          onText={progress.onUpload}
        >
          <FileUp aria-hidden="true" />
        </FileButton>
      )}
    </>
  );
}

/** The Workflow file's own download and upload, after the progress file's. */
function WorkflowFileIcons({ bar, describedBy }: { readonly bar: ToolbarProps; readonly describedBy?: string }) {
  const { controls, words } = bar;
  return (
    <>
      {offers(controls, 'download') && (
        <ToolButton
          label={words.download}
          data-control="download"
          variant="ghost"
          onClick={() => saveFile(workflowFile(bar.workflow))}
        >
          <Download aria-hidden="true" />
        </ToolButton>
      )}
      {offers(controls, 'upload') && (
        <FileButton control="upload" label={words.upload} describedBy={describedBy} onText={bar.onUpload}>
          <Upload aria-hidden="true" />
        </FileButton>
      )}
    </>
  );
}

/** The icon buttons the registry and the Preset allow, in order: view, `</>`, Demo mode, Debug, progress save and load, download, upload. */
function Icons({
  bar,
  describedBy,
  demo,
}: {
  readonly bar: ToolbarProps;
  readonly describedBy?: string;
  readonly demo: ReactNode;
}) {
  const { controls, readonly, words, level } = bar;
  return (
    <>
      {offers(controls, 'view') && <ViewControl words={words} view={bar.view} onView={bar.onView} />}
      {offers(controls, 'level', readonly) && <LevelControl words={words} level={level} onLevel={bar.onLevel} />}
      {demo}
      <DebugToggle words={words} debug={bar.debug} onDebug={bar.onDebug} />
      <ProgressIcons bar={bar} describedBy={describedBy} />
      <WorkflowFileIcons bar={bar} describedBy={describedBy} />
    </>
  );
}

const ICON_CONTROLS: readonly ControlId[] = ['view', 'level', 'demo', 'reset', 'download', 'upload'];
const PROGRESS_CONTROLS: readonly ControlId[] = ['progressDownload', 'progressUpload'];
const hasIcons = (bar: ToolbarProps) =>
  bar.debug.show ||
  ICON_CONTROLS.some((id) => offers(bar.controls, id, bar.readonly)) ||
  (bar.progress !== null && PROGRESS_CONTROLS.some((id) => offers(bar.controls, id, bar.readonly)));

/** What sits under the pill when there is something to say: the progress note, then an upload's problems. */
function Notes({ bar, id }: { readonly bar: ToolbarProps; readonly id: string }) {
  return (
    <>
      {bar.note && <ProgressNote note={bar.note} words={bar.words} />}
      {bar.uploadProblems.length > 0 && <Problems id={id} problems={bar.uploadProblems} />}
    </>
  );
}

export function ToolbarPart(bar: ToolbarProps) {
  const problemsId = useId();
  const demoProps = useDemoProps(bar.words, bar);
  const pills = hasPicker(bar);
  const icons = hasIcons(bar);
  if (!pills && !icons) return <Notes bar={bar} id={problemsId} />;
  const describedBy = bar.uploadProblems.length > 0 ? problemsId : undefined;
  return (
    <>
      <div className={cn(TOOLBAR_ROW, 'mb-4')}>
        <div
          className={TOOLBAR_PILL}
          role="toolbar"
          aria-label={bar.words.toolbar}
          data-part="toolbar"
          data-level={bar.level}
        >
          <Picker bar={bar} />
          {pills && icons ? <Separator orientation="vertical" className="mx-1 my-2" /> : null}
          <Icons bar={bar} describedBy={describedBy} demo={<DemoToggle {...demoProps} />} />
        </div>
        <Reset {...demoProps} />
      </div>
      <ResetConfirm {...demoProps} />
      <Notes bar={bar} id={problemsId} />
    </>
  );
}
