import { MarkdownRolesInteractive } from '@/components/episodes/maintaining-markdown-for-ai/client/markdown-roles.client';

export function MarkdownRoles({ knowledgeTarget }: { knowledgeTarget?: string }) {
  return <MarkdownRolesInteractive knowledgeTarget={knowledgeTarget} />;
}
