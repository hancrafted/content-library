import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import styles from './why-it-takes-time-to-ramp-up.module.css';

/** The closing stamp, the cashflow board's "Bankrupt" gesture in `primary`: this one is the way out. */
export function RampStamp({ children }: { children: ReactNode }) {
  return (
    <p
      className={clsx(
        styles.stamp,
        'mt-8 w-fit -rotate-3 rounded-sm border-2 border-primary px-4 py-2 text-body font-semibold tracking-wide text-primary uppercase ml-1 @md:mr-1 @md:ml-auto',
      )}
    >
      {children}
    </p>
  );
}
