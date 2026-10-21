import { ContextBarView } from './context-bar-view';
import { barModel } from './context-bars.pure';
import { percentText, shortTokens } from './context-format.pure';
import { fill } from './context-view';
import type { ContextWords } from './context-words.types';
import styles from './context.module.css';
import type { Chat, MiniBar, MiniPreset } from './context.types';

/* Static bars: one figure per bar, drawn horizontally with the pure view. Server-rendered, no interaction. */

interface Props {
  readonly mini: MiniPreset;
  readonly chats: Readonly<Record<string, Chat>>;
  readonly words: ContextWords;
  readonly locale: string;
}

interface FigureProps extends Pick<Props, 'words' | 'locale'> {
  readonly bar: MiniBar;
  readonly chat: Chat | undefined;
  readonly window: MiniPreset['window'];
}

/** The caption's figure: a chat's `128K of 200K · 64%`. */
function figureText({ window, words, locale }: FigureProps, used: number): string {
  return fill(words.mini.usedOf, {
    used: shortTokens(used, locale).toUpperCase(),
    window: shortTokens(window.tokens, locale).toUpperCase(),
    percent: percentText((used / window.tokens) * 100, locale),
  });
}

function smartZoneLines(window: MiniPreset['window'], used: number) {
  return window.lines.map((line) => ({ id: line.id, at: line.tokens / window.tokens, crossed: line.tokens <= used }));
}

function Figure(props: FigureProps) {
  const { bar, chat, window, words } = props;
  const model = barModel(bar, chat, window);
  const text = figureText(props, model.used);
  const lines = smartZoneLines(window, model.used);
  return (
    <figure data-discarded={bar.discarded ? '' : undefined}>
      <figcaption>
        <span className="font-medium">{bar.label}</span>
        <small className="text-caption">{bar.discarded ? `${text} · ${words.mini.discarded}` : text}</small>
      </figcaption>
      <ContextBarView
        orientation="horizontal"
        total={model.total}
        blocks={model.blocks}
        buffer={window.bufferTokens}
        lines={lines}
        label={`${bar.label}: ${text}`}
      />
    </figure>
  );
}

export function ContextBars({ mini, chats, words, locale }: Props) {
  return (
    <div className={`${styles.bars} text-caption`} data-bars={mini.id}>
      {mini.mini.map((bar) => {
        const chat = chats[bar.chat];
        if (!chat) throw new Error(`context bars: Preset "${mini.id}" names unknown chat "${bar.chat}"`);
        return <Figure key={bar.label} bar={bar} chat={chat} window={mini.window} words={words} locale={locale} />;
      })}
    </div>
  );
}
