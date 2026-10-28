/** The chat tools a button may show the mark of, by name: a Workflow file names one as data. */
export const CHAT_MARK_NAMES = ['chatgpt', 'gemini'] as const;

export type ChatMarkName = (typeof CHAT_MARK_NAMES)[number];
