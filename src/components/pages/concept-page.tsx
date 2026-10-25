import { contentStore } from '@/components/episodes/content-store';
import { EvidenceBody } from '@/components/evidence/evidence-body';
import { PAGE_CONTAINER, PageHeader } from '@/components/page-header';
import { TRANSLATIONS } from '@/i18n/translations';
import type { Concept } from '@/lib/concepts.pure';
import { evidenceTree } from '@/lib/evidence-markdown.pure';
import { localizePath } from '@/lib/locale.pure';
import type { PageCopy } from '@/lib/page-metadata.pure';
import { conceptRoute, type ConceptId } from '@/lib/routes';
import Link from 'next/link';

/*
 * The page of one Concept at /concepts/<id>, in English only (design-ADR 0016, decision 3): its name, its scoping
 * definition, its body rendered through unified, and the Concepts it sits under, above and beside.
 */

function conceptOf(id: ConceptId): Concept {
  const concept = contentStore().concepts.find((each) => each.id === id);
  if (concept === undefined) throw new Error(`No Concept file for the Concept page ${id}`);
  return concept;
}

/** The page's `<title>` and meta description: the Concept's name and its scoping definition. */
export function conceptPageCopy(id: ConceptId): PageCopy {
  const { title, description } = conceptOf(id);
  return { title, description };
}

type Labels = (typeof TRANSLATIONS)['en']['conceptPage'];

/** One row of links to other Concept pages, left out when the Concept names none. */
function ConceptLinks({ label, ids, titles }: { label: string; ids: readonly string[]; titles: Map<string, string> }) {
  if (ids.length === 0) return null;
  return (
    <div data-concept-links={label} className="space-y-2">
      <dt className="text-caption font-semibold text-muted-foreground">{label}</dt>
      <dd>
        <ul className="flex flex-wrap gap-2">
          {ids.map((id) => (
            <li key={id}>
              <Link href={localizePath(conceptRoute(id), 'en')} className="text-body underline">
                {titles.get(id) ?? id}
              </Link>
            </li>
          ))}
        </ul>
      </dd>
    </div>
  );
}

function Hierarchy({ concept, labels }: { concept: Concept; labels: Labels }) {
  const titles = new Map(contentStore().concepts.map(({ id, title }) => [id, title]));
  const rows = [
    { label: labels.broader, ids: concept.broader },
    { label: labels.narrower, ids: concept.narrower },
    { label: labels.related, ids: concept.related },
  ];
  if (rows.every(({ ids }) => ids.length === 0)) return null;
  return (
    <dl className="mt-10 max-w-3xl space-y-6 border-t border-border pt-6">
      {rows.map((row) => (
        <ConceptLinks key={row.label} label={row.label} ids={row.ids} titles={titles} />
      ))}
    </dl>
  );
}

export function ConceptPage({ id }: { id: ConceptId }) {
  const labels = TRANSLATIONS.en.conceptPage;
  const concept = conceptOf(id);
  const aliases = concept.aliases ?? [];
  return (
    <main data-concept-page={id} className={PAGE_CONTAINER}>
      <p className="mb-3 font-mono text-caption uppercase tracking-widest text-muted-foreground">{labels.eyebrow}</p>
      <PageHeader title={concept.title} intro={<p>{concept.description}</p>}>
        {aliases.length > 0 && (
          <p data-concept-aliases className="text-caption text-muted-foreground">
            {labels.aliases}: {aliases.join(', ')}
          </p>
        )}
      </PageHeader>
      <EvidenceBody tree={evidenceTree(concept.body, { withoutTitle: true })} />
      <Hierarchy concept={concept} labels={labels} />
    </main>
  );
}
