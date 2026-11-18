import { aiAttentionSpan } from '@/episodes/ai-attention-span/episode';
import { instanceOf } from '@/episodes/lib/episode-instance';

// decision: docs/decision-records/0028-an-event-copy-is-an-instance-of-its-episode.md
export const axelAiAttentionSpan = instanceOf(aiAttentionSpan, {});
