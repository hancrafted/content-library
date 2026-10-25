import { ResearchPage, researchPageCopy } from '@/components/pages/research-page';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { isResearchId } from '@/lib/research-ids';
import { researchParams } from '@/lib/routes';
import { notFound } from 'next/navigation';

interface ResearchParams {
  params: Promise<{ research: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = researchParams;

export async function generateMetadata({ params }: ResearchParams) {
  const { research } = await params;
  if (!isResearchId(research)) notFound();
  return pageMetadata({ research }, 'en', researchPageCopy(research));
}

export default async function Page({ params }: ResearchParams) {
  const { research } = await params;
  if (!isResearchId(research)) notFound();
  return <ResearchPage id={research} />;
}
