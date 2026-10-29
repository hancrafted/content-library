import type { Section } from '@/episodes/components/slide-master/slide';
import { downloadAndUnzipTheStarterFolder } from '../slides/download-and-unzip-the-starter-folder/slide';
import { startTheAgentInsideThatFolder } from '../slides/start-the-agent-inside-that-folder/slide';
import { yourFolder } from '../slides/your-folder/slide';

/** Placement marker of the Section "Your folder": its section slide, then its page Slides in Spec order. */
export const yourFolderSection: Section = [yourFolder, downloadAndUnzipTheStarterFolder, startTheAgentInsideThatFolder];
