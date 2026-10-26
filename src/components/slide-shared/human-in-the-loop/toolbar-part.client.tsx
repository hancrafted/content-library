'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, FileDown, FileUp, Upload } from 'lucide-react';
import { useId, type ChangeEvent, type ReactNode } from 'react';
import type { ToolbarProps } from './human-in-the-loop.types';
import { LevelControl } from './level-control.client';
import { ProgressNote } from './progress-note.client';
import { saveFile } from './save-file';
import { ResetConfirm, TeachingControls, useTeachingProps } from './teaching-controls.client';
import { ToolButton } from './tool-button.client';
import { offers, type ControlId } from './toolbar-controls.pure';
import { ViewControl } from './view-control.client';
import { workflowFile } from './workflow-file.pure';

/*
 * The one pill toolbar, as the context window's: the use case picker ("Use case: <Workflow>", a shadcn select), a
 * separator, then the controls in order: view, Chat · CLI, teaching switch and Reset, save and load progress, download
 * and upload of the Workflow file, each icon with a tooltip. The control registry says what shows; a readonly Preset
 * also drops Chat · CLI, the teaching switch and Reset. Under the pill sit Reset's confirmation and the notes. The
 * parent validates an upload; this part only reads the chosen file.
 */

/** The picker's options: the Workflows, after an uploaded one that is none of them. */
function Options({ bar, known }: { readonly bar: ToolbarProps; readonly known: boolean }) {
  return (
    <>
      {known ? null : (
        <SelectItem value={bar.workflow.id} disabled>
          {bar.workflow.title}
        </SelectItem>
      )}
      {bar.choices.map((c) => (
        <SelectItem key={c.id} value={c.id} data-workflow={c.id}>
          {c.title}
        </SelectItem>
      ))}
    </>
  );
}

/** The use case picker: a visible label and a shadcn Select of the Workflows; an uploaded one joins as its own option. */
function Picker({ bar }: { readonly bar: ToolbarProps }) {
  const id = useId();
  if (!offers(bar.controls, 'picker') || bar.choices.length < 2) return null;
  const known = bar.choices.some((c) => c.id === bar.workflow.id);
  return (
    <div className="flex min-w-0 items-center gap-2 pl-3" data-control="picker">
      <Label htmlFor={id} className="text-caption">
        {bar.words.workflow}:
      </Label>
      <Select value={bar.workflow.id} onValueChange={bar.onWorkflow}>
        <SelectTrigger id={id}>
          {/* The title as children: Radix renders an empty value until hydration, so the static page would show none. */}
          <SelectValue>{bar.workflow.title}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <Options bar={bar} known={known} />
        </SelectContent>
      </Select>
    </div>
  );
}

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

/** The progress file's save and load: the run of an authored Workflow only, so none while an uploaded one is shown. */
function ProgressIcons({ bar, describedBy }: { readonly bar: ToolbarProps; readonly describedBy?: string }) {
  const { controls, words, progress } = bar;
  if (!progress) return null;
  return (
    <>
      {offers(controls, 'progressDownload') && (
        <ToolButton
          label={words.progressSave}
          data-control="progressDownload"
          variant="ghost"
          onClick={progress.onDownload}
        >
          <FileDown aria-hidden="true" />
        </ToolButton>
      )}
      {offers(controls, 'progressUpload') && (
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

/** The icon buttons the registry and the Preset allow, in order: view, Chat · CLI, progress save and load, download, upload. */
function Icons({
  bar,
  describedBy,
  teaching,
}: {
  readonly bar: ToolbarProps;
  readonly describedBy?: string;
  readonly teaching: ReactNode;
}) {
  const { controls, readonly, words, level } = bar;
  return (
    <>
      {offers(controls, 'view') && <ViewControl words={words} view={bar.view} onView={bar.onView} />}
      {offers(controls, 'level', readonly) && <LevelControl words={words} level={level} onLevel={bar.onLevel} />}
      {teaching}
      <ProgressIcons bar={bar} describedBy={describedBy} />
      <WorkflowFileIcons bar={bar} describedBy={describedBy} />
    </>
  );
}

const hasPills = (bar: ToolbarProps) => offers(bar.controls, 'picker') && bar.choices.length > 1;
const ICON_CONTROLS: readonly ControlId[] = ['view', 'level', 'teaching', 'reset', 'download', 'upload'];
const PROGRESS_CONTROLS: readonly ControlId[] = ['progressDownload', 'progressUpload'];
const hasIcons = (bar: ToolbarProps) =>
  ICON_CONTROLS.some((id) => offers(bar.controls, id, bar.readonly)) ||
  (bar.progress !== null && PROGRESS_CONTROLS.some((id) => offers(bar.controls, id)));

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
  const teachingProps = useTeachingProps(bar.words, bar);
  const pills = hasPills(bar);
  const icons = hasIcons(bar);
  if (!pills && !icons) return <Notes bar={bar} id={problemsId} />;
  const describedBy = bar.uploadProblems.length > 0 ? problemsId : undefined;
  return (
    <>
      <div
        className="mb-4 flex w-fit max-w-full flex-wrap items-center gap-0.5 rounded-full border bg-muted p-[3px]"
        role="toolbar"
        aria-label={bar.words.toolbar}
        data-part="toolbar"
        data-level={bar.level}
      >
        <Picker bar={bar} />
        {pills && icons ? <Separator orientation="vertical" className="mx-1 my-2" /> : null}
        <Icons bar={bar} describedBy={describedBy} teaching={<TeachingControls {...teachingProps} />} />
      </div>
      <ResetConfirm {...teachingProps} />
      <Notes bar={bar} id={problemsId} />
    </>
  );
}
