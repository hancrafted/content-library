// tech-debt: step goals hard-coded outside the Workflow file, https://github.com/hancrafted/content-library/issues/370
/*
 * The one-sentence goal of each step, hard-coded for the vacation Workflow until the Workflow file carries it. A step
 * without one falls back to the job's title (a do step) or to the word the Slide gives the review.
 */

const GOALS: Readonly<Record<string, { readonly do: string; readonly review: string }>> = {
  pieces: {
    do: 'Create a high-level plan with AI and split it into smaller pieces.',
    review: 'Have a second AI chat check the plan before you move on.',
  },
  interview: {
    do: 'Let the AI interview you about the first piece, a few questions at a time.',
    review: 'Have a second AI chat check the interview.',
  },
  spec: {
    do: 'Turn your answers into a requirements card and sign it off.',
    review: 'Have a second AI chat check the requirements card.',
  },
  tickets: {
    do: 'Write one self-contained ticket per option to research.',
    review: 'Have a second AI chat check the tickets.',
  },
  venue: {
    do: 'Research each ticket in its own fresh chat, with web search.',
    review: 'Have a second AI chat check the research.',
  },
  compare: {
    do: 'Rank the research results against your requirements.',
    review: 'Have a second AI chat check the ranking.',
  },
  recommend: {
    do: 'Get one clear recommendation with next steps.',
    review: 'Have a second AI chat check the recommendation.',
  },
};

export function goalOf(jobId: string, kind: 'do' | 'review', fallback: string): string {
  return GOALS[jobId]?.[kind] ?? fallback;
}
