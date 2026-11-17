export const CHAT_MARK_NAMES = ['chatgpt', 'gemini'] as const;

export type ChatMarkName = (typeof CHAT_MARK_NAMES)[number];
