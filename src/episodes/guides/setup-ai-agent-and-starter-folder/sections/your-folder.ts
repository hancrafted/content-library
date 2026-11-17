import type { Section } from '@/episodes/components/slide-master/slide';
import { downloadAndUnzipTheStarterFolder } from '../slides/download-and-unzip-the-starter-folder/slide';
import { logIn } from '../slides/log-in/slide';
import { startTheAgentInsideThatFolder } from '../slides/start-the-agent-inside-that-folder/slide';
import { yourFolder } from '../slides/your-folder/slide';

export const yourFolderSection: Section = [
  yourFolder,
  downloadAndUnzipTheStarterFolder,
  startTheAgentInsideThatFolder,
  logIn,
];
