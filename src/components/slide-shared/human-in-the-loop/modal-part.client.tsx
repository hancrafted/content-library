'use client';

import type { ModalProps } from './human-in-the-loop.types';

/** The job modal part. A stub until the modal ticket opens a native dialog for `job`; it draws nothing while `job` is null. */
export function ModalPart({ job }: ModalProps) {
  return job ? <div data-part="modal" data-job={job.id} /> : null;
}
