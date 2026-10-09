import { MarkdownRolesInteractive } from '@/components/episodes/maintaining-markdown-for-ai/client/markdown-roles.client';
import type { TargetProps } from '@/components/slide-master/episode-record';

export function MarkdownRoles({ knowledgeTarget }: { knowledgeTarget?: TargetProps }) {
  return <MarkdownRolesInteractive knowledgeTarget={knowledgeTarget} />;
}
