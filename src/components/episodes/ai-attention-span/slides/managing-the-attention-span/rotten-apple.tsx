import styles from './rotten-apple.module.css';

/**
 * A small rotten apple with an evil smile, a wink at context rot. Decorative: the Slide says everything in words, so
 * it is hidden from assistive technology.
 */
export function RottenApple() {
  return (
    <svg data-rotten-apple="" viewBox="0 0 64 64" className={styles.apple} aria-hidden="true">
      <path className={styles.stem} d="M32 16 C32 10 34 7 37 5" />
      <path className={styles.leaf} d="M36 12 C40 5 49 5 52 8 C48 14 41 15 36 12 Z" />
      <path
        className={styles.skin}
        d="M32 18 C24 12 9 16 9 35 C9 50 20 60 32 58 C44 60 55 50 55 35 C55 16 40 12 32 18 Z"
      />
      <path className={styles.rot} d="M43 24 C51 25 55 33 53 41 C48 40 44 36 42 31 C40 28 40 25 43 24 Z" />
      <circle className={styles.rot} cx="16" cy="45" r="3" />
      <path className={styles.brow} d="M18 29 L28 33 M46 29 L36 33" />
      <circle className={styles.face} cx="23" cy="36" r="2.6" />
      <circle className={styles.face} cx="41" cy="36" r="2.6" />
      <path className={styles.face} d="M20 44 C26 54 38 54 44 44 C38 47 26 47 20 44 Z" />
      <path className={styles.teeth} d="M26 46.4 L28.5 50 L31 47 L33.5 50 L36 46.8 C32 47.6 30 47.6 26 46.4 Z" />
    </svg>
  );
}
