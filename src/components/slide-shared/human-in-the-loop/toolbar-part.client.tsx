'use client';

import { useMotion } from '@/hooks/use-motion';
import { Code, Download, Upload } from 'lucide-react';
import { useId, type ButtonHTMLAttributes, type ChangeEvent } from 'react';
import styles from './human-in-the-loop.module.css';
import type { ToolbarProps } from './human-in-the-loop.types';
import { IconButton } from './icon-button.client';
import { Tip } from './tip.client';
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

function Pill({ children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const motion = useMotion(rest['aria-pressed']);
  return (
    <button type="button" {...motion} {...rest}>
      {children}
    </button>
  );
}

function Pills({ bar }: { readonly bar: ToolbarProps }) {
  if (!offers(bar.controls, 'picker') || bar.choices.length < 2) return null;
  const known = bar.choices.some((c) => c.id === bar.workflow.id);
  return (
    <div className={styles.pills} role="group" aria-label={bar.words.workflow} data-control="picker">
      {known ? null : <Pill aria-pressed="true">{bar.workflow.title}</Pill>}
      {bar.choices.map((c) => (
        <Pill
          key={c.id}
          data-workflow={c.id}
          aria-pressed={known && c.id === bar.workflow.id}
          className={known && c.id === bar.workflow.id ? 'font-semibold' : undefined}
          onClick={() => bar.onWorkflow(c.id)}
        >
          {c.title}
        </Pill>
      ))}
    </div>
  );
}

function UploadButton({ bar, describedBy }: { readonly bar: ToolbarProps; readonly describedBy?: string }) {
  const motion = useMotion();
  const readChosenFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) bar.onUpload(await file.text());
    event.target.value = '';
  };
  return (
    <Tip text={bar.words.upload} align="end">
      <label className={`${styles.icon} ${styles.upload}`} data-control="upload" {...motion}>
        <Upload aria-hidden="true" />
        <input
          type="file"
          accept=".yml,.yaml,application/x-yaml,text/yaml"
          aria-label={bar.words.upload}
          aria-describedby={describedBy}
          onChange={readChosenFile}
        />
      </label>
    </Tip>
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
function Icons({ bar }: { readonly bar: ToolbarProps }) {
  const { controls, readonly, words, level } = bar;
  return (
    <>
      {offers(controls, 'level', readonly) && (
        <IconButton
          className={styles.icon}
          label={words.technical}
          tip={words.technicalTip}
          data-control="level"
          aria-pressed={level === 'technical'}
          onClick={() => bar.onLevel(level === 'technical' ? 'simple' : 'technical')}
        >
          <Code aria-hidden="true" />
        </IconButton>
      )}
      {offers(controls, 'download') && (
        <IconButton
          className={styles.icon}
          label={words.download}
          align="end"
          data-control="download"
          onClick={() => download(bar.workflow)}
        >
          <Download aria-hidden="true" />
        </IconButton>
      )}
    </>
  );
}

const hasPills = (bar: ToolbarProps) => offers(bar.controls, 'picker') && bar.choices.length > 1;
const hasIcons = (bar: ToolbarProps) =>
  offers(bar.controls, 'level', bar.readonly) || offers(bar.controls, 'download') || offers(bar.controls, 'upload');

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
        className={styles.toolbar}
        role="toolbar"
        aria-label={bar.words.toolbar}
        data-part="toolbar"
        data-level={bar.level}
      >
        <Pills bar={bar} />
        {pills && icons ? <span className={styles.sep} aria-hidden="true" /> : null}
        <Icons bar={bar} />
        {offers(bar.controls, 'upload') && <UploadButton bar={bar} describedBy={describedBy} />}
      </div>
      <UploadProblems bar={bar} id={problemsId} />
    </>
  );
}
