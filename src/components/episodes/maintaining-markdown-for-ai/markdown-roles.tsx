import { MarkdownRolesInteractive } from '@/components/episodes/maintaining-markdown-for-ai/client/markdown-roles.client';

export function MarkdownRoles({ knowledgeId }: { knowledgeId?: string }) {
  return <MarkdownRolesInteractive knowledgeId={knowledgeId} />;
}
