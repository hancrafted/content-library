'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, Upload } from 'lucide-react';
import { useId, type ChangeEvent } from 'react';
import type { ToolbarProps } from './human-in-the-loop.types';
import { LevelControl } from './level-control.client';
import { ToolButton } from './tool-button.client';
import { offers } from './toolbar-controls.pure';
import { ViewControl } from './view-control.client';
import { workflowFile } from './workflow-file.pure';

/*
 * The one pill toolbar, as the context window's: the use case picker ("Use case: <Workflow>", a native select), a
 * separator, then icon buttons (download, upload) after the Chat · CLI control, each with a tooltip. The control registry says what shows; a readonly Preset also drops
 * the Chat · CLI control. The parent validates an upload; this part only reads the chosen file.
 */

function download(workflow: ToolbarProps['workflow']) {
  const { name, text, type } = workflowFile(workflow);
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = Object.assign(document.createElement('a'), { download: name });
  link.setAttribute('href', url);
  link.click();
  URL.revokeObjectURL(url);
}

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

function UploadButton({ bar, describedBy }: { readonly bar: ToolbarProps; readonly describedBy?: string }) {
  const readChosenFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) bar.onUpload(await file.text());
    event.target.value = '';
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant="ghost" size="icon" className={UPLOAD_BUTTON}>
          <label data-control="upload">
            <Upload aria-hidden="true" />
            <input
              type="file"
              accept=".yml,.yaml,application/x-yaml,text/yaml"
              aria-label={bar.words.upload}
              aria-describedby={describedBy}
              onChange={readChosenFile}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
          </label>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{bar.words.upload}</TooltipContent>
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

/** The icon buttons the registry and the Preset allow, in order: view, Chat · CLI, download, upload. */
function Icons({ bar }: { readonly bar: ToolbarProps }) {
  const { controls, readonly, words, level } = bar;
  return (
    <>
      {offers(controls, 'view') && <ViewControl words={words} view={bar.view} onView={bar.onView} />}
      {offers(controls, 'level', readonly) && <LevelControl words={words} level={level} onLevel={bar.onLevel} />}
      {offers(controls, 'download') && (
        <ToolButton
          label={words.download}
          data-control="download"
          variant="ghost"
          onClick={() => download(bar.workflow)}
        >
          <Download aria-hidden="true" />
        </ToolButton>
      )}
    </>
  );
}

const hasPills = (bar: ToolbarProps) => offers(bar.controls, 'picker') && bar.choices.length > 1;
const hasIcons = (bar: ToolbarProps) =>
  offers(bar.controls, 'view') ||
  offers(bar.controls, 'level', bar.readonly) ||
  offers(bar.controls, 'download') ||
  offers(bar.controls, 'upload');

function UploadProblems({ bar, id }: { readonly bar: ToolbarProps; readonly id: string }) {
  return bar.uploadProblems.length > 0 ? <Problems id={id} problems={bar.uploadProblems} /> : null;
}

export function ToolbarPart(bar: ToolbarProps) {
  const problemsId = useId();
  const pills = hasPills(bar);
  const icons = hasIcons(bar);
  if (!pills && !icons) return null;
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
        <Icons bar={bar} />
        {offers(bar.controls, 'upload') && <UploadButton bar={bar} describedBy={describedBy} />}
      </div>
      <UploadProblems bar={bar} id={problemsId} />
    </>
  );
}
