import { MarkdownRolesInteractive } from '@/components/episode/markdown-roles.client';

export function MarkdownRoles({ knowledgeId }: { knowledgeId?: string }) {
  return <MarkdownRolesInteractive knowledgeId={knowledgeId} />;
}
