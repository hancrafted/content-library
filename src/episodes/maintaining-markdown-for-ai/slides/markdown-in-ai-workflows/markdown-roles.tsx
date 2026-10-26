import type { TargetProps } from '@/shared/lib/context-link.pure';
import { MarkdownRolesInteractive } from './markdown-roles.client';

export function MarkdownRoles({ knowledgeTarget }: { knowledgeTarget?: TargetProps }) {
  return <MarkdownRolesInteractive knowledgeTarget={knowledgeTarget} />;
}
