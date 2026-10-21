'use client';

import { Download, Upload } from 'lucide-react';
import { useId, type ChangeEvent } from 'react';
import type { ToolbarProps } from './human-in-the-loop.types';
import { offers } from './toolbar-controls.pure';
import { workflowFile } from './workflow-file.pure';

/*
 * The Workflow picker, the download and the upload, each on unless the Slide's Preset turns it off. The toolbar part
 * renders this next to its switches. Mirrors the context visual's file input and Blob download; the parent validates.
 */

export type WorkflowControlsProps = Pick<
  ToolbarProps,
  'workflow' | 'choices' | 'controls' | 'mode' | 'uploadProblems' | 'words' | 'onWorkflow' | 'onUpload'
>;

const button =
  'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md border border-transparent px-2 text-caption font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-within:ring-[3px] focus-within:ring-ring/50';

function download(workflow: WorkflowControlsProps['workflow']) {
  const { name, text, type } = workflowFile(workflow);
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = Object.assign(document.createElement('a'), { download: name });
  link.setAttribute('href', url);
  link.click();
  URL.revokeObjectURL(url);
}

function Picker({ v }: { readonly v: WorkflowControlsProps }) {
  const id = useId();
  const known = v.choices.some((c) => c.id === v.workflow.id);
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {v.words.workflow}
      </label>
      <select
        id={id}
        data-control="picker"
        className="h-7 rounded-md border border-border bg-background px-2 text-caption"
        value={known ? v.workflow.id : ''}
        onChange={(event) => v.onWorkflow(event.target.value)}
      >
        {known ? null : <option value="">{v.workflow.title}</option>}
        {v.choices.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
    </>
  );
}

function DownloadButton({ v }: { readonly v: WorkflowControlsProps }) {
  return (
    <button type="button" className={button} data-control="download" onClick={() => download(v.workflow)}>
      <Download aria-hidden="true" className="size-3.5" />
      {v.words.download}
    </button>
  );
}

function UploadButton({ v, describedBy }: { readonly v: WorkflowControlsProps; readonly describedBy?: string }) {
  const readChosenFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) v.onUpload(await file.text());
    event.target.value = '';
  };
  return (
    <label className={button} data-control="upload">
      <Upload aria-hidden="true" className="size-3.5" />
      {v.words.upload}
      <input
        type="file"
        accept=".yml,.yaml,application/x-yaml,text/yaml"
        className="sr-only"
        aria-describedby={describedBy}
        onChange={readChosenFile}
      />
    </label>
  );
}

function Problems({ id, problems }: { readonly id: string; readonly problems: readonly string[] }) {
  return (
    <ul id={id} role="alert" data-upload-problems="" className="basis-full list-disc pl-5 text-body text-destructive">
      {problems.map((problem) => (
        <li key={problem}>{problem}</li>
      ))}
    </ul>
  );
}

function UploadSection({ v }: { readonly v: WorkflowControlsProps }) {
  const problemsId = useId();
  const problems = v.uploadProblems.length > 0;
  return (
    <>
      <UploadButton v={v} describedBy={problems ? problemsId : undefined} />
      {problems ? <Problems id={problemsId} problems={v.uploadProblems} /> : null}
    </>
  );
}

/** Which of the three controls the toolbar draws for the mode and the Preset. */
function shownIn({ controls, mode, choices }: WorkflowControlsProps) {
  return {
    picker: offers(controls, 'picker', mode) && choices.length > 1,
    download: offers(controls, 'download', mode),
    upload: offers(controls, 'upload', mode),
  };
}

export function WorkflowControls(v: WorkflowControlsProps) {
  const shown = shownIn(v);
  if (!Object.values(shown).includes(true)) return null;
  return (
    <div className="flex flex-wrap items-center gap-1 sm:ml-auto" data-workflow-controls="">
      {shown.picker ? <Picker v={v} /> : null}
      {shown.download ? <DownloadButton v={v} /> : null}
      {shown.upload ? <UploadSection v={v} /> : null}
    </div>
  );
}
