import { percentText } from './context-format.pure';
import { fill } from './context-view';
import styles from './context-window.module.css';
import { colourOf, miniFigure } from './context-window.pure';
import type { Chat, MiniBar, MiniPreset, WindowSize } from './context-window.types';
import type { ContextWindowWords } from './context-words.types';
import { tint, vars } from './window-bits';

/* Static mini bars: the bar's blocks and colours, one figure per chat, no interaction. Server-rendered. */

interface Props {
  readonly mini: MiniPreset;
  readonly chats: Readonly<Record<string, Chat>>;
  readonly words: ContextWindowWords;
  readonly locale: string;
}

interface FigureProps {
  readonly chat: Chat;
  readonly bar: MiniBar;
  readonly window: WindowSize;
}

function MiniBarBody({ chat, bar, window }: FigureProps) {
  const figure = miniFigure(chat, bar, window);
  const pct = (tokens: number) => (tokens / window.tokens) * 100;
  return (
    <>
      {figure.blocks.map((b) => (
        <div
          key={b.key}
          className={styles.block}
          style={tint(colourOf(b.cat, 'simple'), { '--s': pct(b.start), '--z': pct(b.tokens) })}
        />
      ))}
      <div className={styles.buffer} style={vars({ '--z': pct(window.bufferTokens) })} />
      {window.lines.map((line) => (
        <div
          key={line.id}
          className={styles.line}
          data-crossed={line.tokens <= figure.used ? '' : undefined}
          style={vars({ '--f': line.tokens / window.tokens })}
        />
      ))}
    </>
  );
}

function MiniFigure({ words, locale, ...props }: FigureProps & Pick<Props, 'words' | 'locale'>) {
  const { bar } = props;
  const used = fill(words.mini.used, {
    percent: percentText(miniFigure(props.chat, bar, props.window).percent, locale),
  });
  return (
    <figure data-discarded={bar.discarded ? '' : undefined}>
      <div className={styles.bar} role="img" aria-label={`${bar.label}: ${used}`}>
        <MiniBarBody {...props} />
      </div>
      <figcaption>
        <span className="font-medium">{bar.label}</span>
        <small className="text-caption">{bar.discarded ? `${used} · ${words.mini.discarded}` : used}</small>
      </figcaption>
    </figure>
  );
}

export function MiniBars({ mini, chats, words, locale }: Props) {
  return (
    <div className={`${styles.mini} text-caption`} data-mini={mini.id}>
      {mini.mini.map((bar) => {
        const chat = chats[bar.chat];
        if (!chat) throw new Error(`context window: mini Preset "${mini.id}" names unknown chat "${bar.chat}"`);
        return <MiniFigure key={bar.label} chat={chat} bar={bar} window={mini.window} words={words} locale={locale} />;
      })}
    </div>
  );
}
