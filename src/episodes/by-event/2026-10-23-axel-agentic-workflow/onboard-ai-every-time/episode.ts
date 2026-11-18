import { instanceOf } from '@/episodes/lib/episode-instance';
import { onboardAiEveryTime } from '@/episodes/onboard-ai-every-time/episode';

// decision: docs/decision-records/0028-an-event-copy-is-an-instance-of-its-episode.md
export const axelOnboardAiEveryTime = instanceOf(onboardAiEveryTime, {});
