import { contentStore } from '@/components/episodes/content-store';
import { EvidenceBody } from '@/components/evidence/evidence-body';
import { PAGE_CONTAINER, PageHeader } from '@/components/page-header';
import { TRANSLATIONS } from '@/i18n/translations';
import { CONFIDENCE_DEFINITIONS } from '@/lib/confidence.pure';
import { evidenceTree } from '@/lib/evidence-markdown.pure';
import { externalHref } from '@/lib/external-link.pure';
import { localizePath } from '@/lib/locale.pure';
import type { PageCopy } from '@/lib/page-metadata.pure';
import { sourceAnchor } from '@/lib/remark-citations.pure';
import { isResearchId, type ResearchId } from '@/lib/research-ids';
import type { ResearchRecord } from '@/lib/research-record.pure';
import { conceptRoute, researchRoute } from '@/lib/routes';
import Link from 'next/link';

/*
 * The page of one promoted Research question at /research/<id>, in English only (design-ADR 0016, Citations rule 6):
 * the question, how settled its Answer is as a badge with that value's definition, the Concepts it informs, its body
 * rendered through unified with every [n] marker linked to the nth Source, and the Sources list those markers point at.
 */

type Labels = (typeof TRANSLATIONS)['en']['researchPage'];
type Source = ResearchRecord['sources'][number];

function researchOf(id: ResearchId): ResearchRecord {
  const research = contentStore().research.find((each) => each.id === id && !each.staged);
  if (research === undefined) throw new Error(`No promoted research file for the Research page ${id}`);
  return research;
}

/** The page's `<title>` and meta description: the question and its one-sentence Answer. */
export function researchPageCopy(id: ResearchId): PageCopy {
  const { title, description } = researchOf(id);
  return { title, description };
}

function ConfidenceBadge({ research, labels }: { research: ResearchRecord; labels: Labels }) {
  const { confidence, confirmed } = research;
  return (
    <div data-confidence={confidence} data-confidence-confirmed={confirmed} className="space-y-1">
      <p className="text-caption text-muted-foreground">
        {labels.confidence}:{' '}
        <span className="rounded-full border border-border px-2.5 py-0.5 font-semibold text-foreground">
          {labels[confidence]}
        </span>
        {!confirmed && <span data-confidence-proposed> {labels.proposed}</span>}
      </p>
      <p data-confidence-definition className="text-caption text-muted-foreground">
        {CONFIDENCE_DEFINITIONS[confidence]}
      </p>
    </div>
  );
}

function Informs({ research, labels }: { research: ResearchRecord; labels: Labels }) {
  const titles = new Map(contentStore().concepts.map(({ id, title }) => [id, title]));
  return (
    <p data-research-informs className="text-caption text-muted-foreground">
      {labels.informs}:{' '}
      {research.informs.map((id, at) => (
        <span key={id}>
          {at > 0 && ', '}
          <Link href={localizePath(conceptRoute(id), 'en')} className="underline">
            {titles.get(id) ?? id}
          </Link>
        </span>
      ))}
    </p>
  );
}

/** The id of the promoted Research question a repo-path Source names, when it names one. */
function researchIdOf(resource: string): ResearchId | undefined {
  const id = /(?:^|\/)docs\/llm-wiki\/research\/[^/]+\/([A-Z]+-\d{4})__/.exec(resource)?.[1];
  return id !== undefined && isResearchId(id) ? id : undefined;
}

/** One Source: a link out for an `https:` URL, a link to its page for another Research question, else its text. */
function SourceItem({ source, labels }: { source: Source; labels: Labels }) {
  const research = researchIdOf(source.resource);
  let body;
  if (research !== undefined) {
    body = (
      <Link href={localizePath(researchRoute(research), 'en')} className="underline">
        {source.title}
      </Link>
    );
  } else if (source.resource.startsWith('https://')) {
    body = (
      <a href={externalHref(source.resource)} target="_blank" rel="noopener noreferrer" className="underline">
        {source.title}
        <span className="sr-only"> ({labels.newTab})</span>
      </a>
    );
  } else {
    body = (
      <>
        {source.title} <span className="break-all text-muted-foreground">{source.resource}</span>
      </>
    );
  }
  return (
    <li id={sourceAnchor(source.id)} data-source={source.id} className="scroll-mt-24">
      {body}
    </li>
  );
}

export function ResearchPage({ id }: { id: ResearchId }) {
  const labels = TRANSLATIONS.en.researchPage;
  const research = researchOf(id);
  const tree = evidenceTree(research.body, { withoutTitle: true, sources: research.sources.map((s) => s.id) });
  return (
    <main data-research-page={id} className={PAGE_CONTAINER}>
      <p className="mb-3 font-mono text-caption uppercase tracking-widest text-muted-foreground">
        {labels.eyebrow} · {id}
      </p>
      <PageHeader title={research.title} intro={<p>{research.description}</p>}>
        <ConfidenceBadge research={research} labels={labels} />
        <Informs research={research} labels={labels} />
      </PageHeader>
      <EvidenceBody tree={tree} />
      <section data-research-sources className="mt-10 max-w-3xl border-t border-border pt-6">
        <h2 className="mb-4 text-body font-semibold text-foreground">{labels.sources}</h2>
        <ol className="list-decimal space-y-2 pl-6 text-body text-foreground">
          {research.sources.map((source) => (
            <SourceItem key={source.id} source={source} labels={labels} />
          ))}
        </ol>
      </section>
    </main>
  );
}
