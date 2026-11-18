import type { Section } from '@/episodes/components/slide-master/slide';
import { aeHarness } from '../slides/ae-harness/slide';
import { aeParallelCli } from '../slides/ae-parallel-cli/slide';
import { enablementClaudeDesktop } from '../slides/enablement-claude-desktop/slide';
import { foundation } from '../slides/foundation/slide';
import { matrix } from '../slides/matrix/slide';
import { overview } from '../slides/overview/slide';

export const overviewSection: Section = [
  overview,
  foundation,
  enablementClaudeDesktop,
  aeHarness,
  aeParallelCli,
  matrix,
];
