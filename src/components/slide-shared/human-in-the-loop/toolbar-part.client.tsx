'use client';

import { Code, Download, Upload } from 'lucide-react';
import { useId, type ChangeEvent, type ReactNode } from 'react';
import styles from './human-in-the-loop.module.css';
import type { ToolbarProps } from './human-in-the-loop.types';
import { offers } from './toolbar-controls.pure';
import { workflowFile } from './workflow-file.pure';

/*
 * The one pill toolbar, as the context window's: the Workflow pills, a separator, then icon buttons (Technical
 * `</>`, download, upload), each with a tooltip. The control registry says what shows; a readonly Preset also drops
 * the Technical toggle. The parent validates an upload; this part only reads the chosen file.
 */

function download(workflow: ToolbarProps['workflow']) {
  const { name, text, type } = workflowFile(workflow);
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = Object.assign(document.createElement('a'), { download: name });
  link.setAttribute('href', url);
  link.click();
  URL.revokeObjectURL(url);
}

interface IconProps {
  readonly label: string;
  /** The tooltip, where it says more than the name. */
  readonly tip?: string;
  readonly control: string;
  readonly pressed?: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
}

/** An icon button: the label is its accessible name and its tooltip (`data-tip`, shown on hover and keyboard focus). */
function IconButton({ label, tip = label, control, pressed, onClick, children }: IconProps) {
  return (
    <button
      type="button"
      className={styles.icon}
      aria-label={label}
      data-tip={tip}
      data-control={control}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Pills({ v }: { readonly v: ToolbarProps }) {
  if (!offers(v.controls, 'picker') || v.choices.length < 2) return null;
  const known = v.choices.some((c) => c.id === v.workflow.id);
  return (
    <div className={styles.pills} role="group" aria-label={v.words.workflow} data-control="picker">
      {known ? null : (
        <button type="button" aria-pressed="true">
          {v.workflow.title}
        </button>
      )}
      {v.choices.map((c) => (
        <button
          key={c.id}
          type="button"
          data-workflow={c.id}
          aria-pressed={known && c.id === v.workflow.id}
          className={known && c.id === v.workflow.id ? 'font-semibold' : undefined}
          onClick={() => v.onWorkflow(c.id)}
        >
          {c.title}
        </button>
      ))}
    </div>
  );
}

function UploadButton({ v, describedBy }: { readonly v: ToolbarProps; readonly describedBy?: string }) {
  const readChosenFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) v.onUpload(await file.text());
    event.target.value = '';
  };
  return (
    <label className={`${styles.icon} ${styles.upload}`} data-tip={v.words.upload} data-control="upload">
      <Upload aria-hidden="true" />
      <input
        type="file"
        accept=".yml,.yaml,application/x-yaml,text/yaml"
        aria-label={v.words.upload}
        aria-describedby={describedBy}
        onChange={readChosenFile}
      />
    </label>
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

/** The icon buttons the registry and the Preset allow, in order: Technical, download, upload. */
function Icons({ v }: { readonly v: ToolbarProps }) {
  const { controls, readonly, words, level } = v;
  return (
    <>
      {offers(controls, 'level', readonly) && (
        <IconButton
          label={words.technical}
          tip={words.technicalTip}
          control="level"
          pressed={level === 'technical'}
          onClick={() => v.onLevel(level === 'technical' ? 'simple' : 'technical')}
        >
          <Code aria-hidden="true" />
        </IconButton>
      )}
      {offers(controls, 'download') && (
        <IconButton label={words.download} control="download" onClick={() => download(v.workflow)}>
          <Download aria-hidden="true" />
        </IconButton>
      )}
    </>
  );
}

const hasPills = (v: ToolbarProps) => offers(v.controls, 'picker') && v.choices.length > 1;
const hasIcons = (v: ToolbarProps) =>
  offers(v.controls, 'level', v.readonly) || offers(v.controls, 'download') || offers(v.controls, 'upload');

function UploadProblems({ v, id }: { readonly v: ToolbarProps; readonly id: string }) {
  return v.uploadProblems.length > 0 ? <Problems id={id} problems={v.uploadProblems} /> : null;
}

export function ToolbarPart(v: ToolbarProps) {
  const problemsId = useId();
  const pills = hasPills(v);
  const icons = hasIcons(v);
  if (!pills && !icons) return null;
  const describedBy = v.uploadProblems.length > 0 ? problemsId : undefined;
  return (
    <>
      <div
        className={styles.toolbar}
        role="toolbar"
        aria-label={v.words.toolbar}
        data-part="toolbar"
        data-level={v.level}
      >
        <Pills v={v} />
        {pills && icons ? <span className={styles.sep} aria-hidden="true" /> : null}
        <Icons v={v} />
        {offers(v.controls, 'upload') && <UploadButton v={v} describedBy={describedBy} />}
      </div>
      <UploadProblems v={v} id={problemsId} />
    </>
  );
}
