import { parse } from 'yaml';
import { fromClaudeLog } from './claude-log.pure';
import configDe from './context-preset.config.de.yml';
import configEn from './context-preset.config.yml';
import { presetProblems } from './context-presets.pure';
import type { ContextWords } from './context-words.types';
import type {
  Block,
  Category,
  Chat,
  Line,
  MiniBar,
  MiniPreset,
  Preset,
  Step,
  StepNotes,
  StepStory,
  WindowSize,
} from './context.types';
import logDe from './summer-party.de.jsonl';
import logEn from './summer-party.jsonl';

/*
 * The cornerstone's data at build time: the config pair and the chat log of one locale, parsed, cut into chats and
 * checked. Runs on the server only (the data files are bundled as text); a Slide reaches it through the server entry.
 */

/** Every interactive Preset id, one per Slide state of the Spec's picked Options. A test holds it to the config. */
export const CONTEXT_PRESETS = [
  'slide-3',
  'slide-4',
  'slide-5',
  'slide-6',
  'slide-7',
  'slide-8',
  'slide-9-before',
  'slide-9-chat',
  'slide-9-after',
] as const;
/** Every static mini-bar Preset id. */
export const MINI_PRESETS = ['slide-10-old', 'slide-10-fresh', 'slide-11-before', 'slide-11-after'] as const;

export type ContextPresetId = (typeof CONTEXT_PRESETS)[number];
export type MiniPresetId = (typeof MINI_PRESETS)[number];
export type ContextLocale = 'en' | 'de';

export interface ContextData {
  readonly chats: Readonly<Record<string, Chat>>;
  readonly presets: Readonly<Record<string, Preset>>;
  readonly minis: Readonly<Record<string, MiniPreset>>;
  readonly words: ContextWords;
  readonly story: Readonly<Record<string, StepStory>>;
  readonly notes: Readonly<Record<string, StepNotes>>;
  /** Attention overrides per chat, then per step. */
  readonly attention: Readonly<Record<string, Readonly<Record<string, Readonly<Record<string, number>>>>>>;
}

interface WindowRef {
  readonly size: string;
  readonly lines: readonly string[];
}

interface Config {
  readonly start: { readonly id: string } & Readonly<Record<string, number | string>>;
  readonly memory: number;
  readonly windows: Readonly<Record<string, { readonly tokens: number; readonly buffer: number }>>;
  readonly lines: Readonly<Record<string, { readonly tokens: number; readonly short: string }>>;
  readonly chats: Readonly<
    Record<string, { readonly log?: string; readonly steps?: number; readonly blocks?: readonly [Category, number][] }>
  >;
  readonly notes: Readonly<Record<string, StepNotes>>;
  readonly attention: ContextData['attention'];
  readonly defaults: Omit<Preset, 'id' | 'chat' | 'windows'> & { readonly windows: readonly WindowRef[] };
  readonly presets: Readonly<Record<string, Partial<Config['defaults']> & { readonly chat: string }>>;
  readonly minis: Readonly<
    Record<
      string,
      {
        readonly window: WindowRef;
        readonly bars: readonly { label: string; chat: string; step?: number; discarded?: boolean }[];
      }
    >
  >;
  readonly words: ContextWords;
  readonly story: Readonly<Record<string, StepStory>>;
}

type LocaleConfig = Pick<Config, 'words' | 'story'>;

const LOGS: Readonly<Record<ContextLocale, string>> = { en: logEn, de: logDe };

function startOf(config: Config): { id: string; blocks: Block[] } {
  const blocks = Object.entries(config.start)
    .filter((entry): entry is [Category, number] => entry[0] !== 'id' && typeof entry[1] === 'number')
    .map(([cat, tokens]) => ({ cat, tokens }));
  return { id: config.start.id, blocks };
}

const MINI_STEP: Readonly<Partial<Record<Category, (id: string, blocks: Block[]) => Step>>> = {
  memory: (id, blocks) => ({ id, kind: 'memory', path: 'CLAUDE.md', blocks }),
  tool_use: (id, blocks) => ({ id, kind: 'tool', calls: [], blocks }),
  tool_result: (id, blocks) => ({ id, kind: 'tool', calls: [], blocks }),
  assistant: (id, blocks) => ({ id, kind: 'ai', text: '', blocks }),
};

/** A mini chat: the starting instructions, then one step per block row (a tool call and its result share one). */
function blocksChat(id: string, start: Step, rows: readonly [Category, number][]): Chat {
  const steps: Step[] = [start];
  rows.forEach(([cat, tokens], i) => {
    const previous = steps.at(-1);
    if (cat === 'tool_result' && previous?.kind === 'tool') {
      steps[steps.length - 1] = { ...previous, blocks: [...previous.blocks, { cat, tokens }] };
      return;
    }
    const make =
      MINI_STEP[cat] ?? ((sid: string, blocks: Block[]): Step => ({ id: sid, kind: 'you', text: '', blocks }));
    steps.push(make(`${id}-${i + 1}`, [{ cat, tokens }]));
  });
  return { id, steps };
}

function windowOf(config: Config, words: ContextWords, ref: WindowRef): WindowSize {
  const size = config.windows[ref.size];
  if (!size) throw new Error(`context window: unknown window size "${ref.size}"`);
  const lines = ref.lines.map((lineId): Line => {
    const line = config.lines[lineId];
    const lineWords = words.lines[lineId];
    if (!line || !lineWords) throw new Error(`context window: unknown line "${lineId}"`);
    return { id: lineId, tokens: line.tokens, short: line.short, label: lineWords.label, who: lineWords.who };
  });
  return { tokens: size.tokens, bufferTokens: size.buffer, lines };
}

function chatsOf(en: Config, log: string): Record<string, Chat> {
  const start = startOf(en);
  const startStep: Step = { id: start.id, kind: 'start', blocks: start.blocks };
  const full = fromClaudeLog(log, { id: 'summer-party', start, memory: en.memory });
  return Object.fromEntries(
    Object.entries(en.chats).map(([id, spec]) => {
      if (!spec.log) return [id, blocksChat(id, startStep, spec.blocks ?? [])];
      return [id, { id, steps: spec.steps ? full.steps.slice(0, spec.steps) : full.steps }];
    }),
  );
}

function presetsOf(en: Config, words: ContextWords): Record<string, Preset> {
  return Object.fromEntries(
    Object.entries(en.presets).map(([id, raw]) => {
      const merged = { ...en.defaults, ...raw };
      return [id, { ...merged, id, windows: merged.windows.map((ref) => windowOf(en, words, ref)) }];
    }),
  );
}

function minisOf(en: Config, words: ContextWords, chats: Record<string, Chat>): Record<string, MiniPreset> {
  return Object.fromEntries(
    Object.entries(en.minis).map(([id, raw]) => {
      const mini = raw.bars.map((bar): MiniBar => ({
        label: words.mini.labels[bar.label] ?? bar.label,
        chat: bar.chat,
        step: bar.step ?? chats[bar.chat]?.steps.length ?? 1,
        discarded: bar.discarded === true,
      }));
      return [id, { id, mini, window: windowOf(en, words, raw.window) }];
    }),
  );
}

function build(en: Config, local: LocaleConfig, log: string): ContextData {
  const chats = chatsOf(en, log);
  const presets = presetsOf(en, local.words);
  const problems = Object.values(presets).flatMap((preset) => presetProblems(preset, chats[preset.chat]));
  if (problems.length) throw new Error(`context window Presets:\n${problems.join('\n')}`);
  const minis = minisOf(en, local.words, chats);
  return { chats, presets, minis, words: local.words, story: local.story, notes: en.notes, attention: en.attention };
}

const cache = new Map<ContextLocale, ContextData>();

/** The cornerstone's data in one locale, parsed once per build. */
export function contextData(locale: ContextLocale): ContextData {
  const hit = cache.get(locale);
  if (hit) return hit;
  const en = parse(configEn) as Config;
  const local: LocaleConfig = locale === 'de' ? (parse(configDe) as LocaleConfig) : en;
  const data = build(en, local, LOGS[locale]);
  cache.set(locale, data);
  return data;
}

/** The raw config pair, for the test that keeps the German keys equal to the English ones. */
export const rawConfigs = (): { en: unknown; de: unknown } => ({ en: parse(configEn), de: parse(configDe) });
