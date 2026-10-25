import { ConceptPage, conceptPageCopy } from '@/components/pages/concept-page';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { conceptParams, isConceptId } from '@/lib/routes';
import { notFound } from 'next/navigation';

interface ConceptParams {
  params: Promise<{ concept: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = conceptParams;

export async function generateMetadata({ params }: ConceptParams) {
  const { concept } = await params;
  if (!isConceptId(concept)) notFound();
  return pageMetadata({ concept }, 'en', conceptPageCopy(concept));
}

export default async function Page({ params }: ConceptParams) {
  const { concept } = await params;
  if (!isConceptId(concept)) notFound();
  return <ConceptPage id={concept} />;
}
