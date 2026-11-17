import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import type { ReactNode } from 'react';

export interface Request {
  readonly text: string;
  readonly nearMiss?: boolean;
}

export interface Quote {
  readonly open: string;
  readonly close: string;
}

export interface DescriptionTestProps {
  readonly title: ReactNode;
  readonly lead: { readonly chat: string; readonly coding: string };
  readonly frontMatter: { readonly name: string; readonly description: string };
  readonly should: { readonly label: string; readonly requests: readonly Request[] };
  readonly shouldNot: { readonly label: string; readonly requests: readonly Request[] };
  readonly nearMiss: string;
  readonly quote: Quote;
  readonly footnote: ReactNode;
  readonly target: { readonly 'data-target': string };
  readonly footnoteTarget: { readonly 'data-target': string };
}

interface RequestItemProps {
  readonly kind: 'should' | 'should-not';
  readonly text: string;
  readonly near: boolean;
  readonly nearMiss: string;
  readonly quote: Quote;
}

function RequestItem({ kind, text, near, nearMiss, quote }: RequestItemProps) {
  return (
    <li
      data-request={kind}
      data-near-miss={near ? '' : undefined}
      className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-1.5 text-caption"
    >
      <span data-quote>
        {quote.open}
        <span data-request-text>{text}</span>
        {quote.close}
      </span>
      {near ? (
        <span className="shrink-0 rounded-full border border-(--warning) px-2 text-caption text-(--warning)">
          {nearMiss}
        </span>
      ) : null}
    </li>
  );
}

interface RequestsProps {
  readonly kind: 'should' | 'should-not';
  readonly label: string;
  readonly requests: readonly Request[];
  readonly nearMiss: string;
  readonly quote: Quote;
}

function Requests({ kind, label, requests, nearMiss, quote }: RequestsProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption font-semibold">
        <InView view="chat">{label}</InView>
        <InView view="coding" className="font-mono">
          {`should_trigger: ${kind === 'should'}`}
        </InView>
      </p>
      <ul className="flex flex-col gap-1.5">
        {requests.map(({ text, nearMiss: near }) => (
          <RequestItem key={text} kind={kind} text={text} near={near === true} nearMiss={nearMiss} quote={quote} />
        ))}
      </ul>
    </div>
  );
}

function Lead({ lead, frontMatter }: Pick<DescriptionTestProps, 'lead' | 'frontMatter'>) {
  return (
    <>
      <InView view="chat" as="p" className="text-caption text-muted-foreground">
        {lead.chat}
      </InView>
      <InView view="coding" as="div" className="flex flex-col gap-1">
        <p className="text-caption text-muted-foreground">{lead.coding}</p>
        <code
          translate="no"
          className="block rounded-md bg-card-foreground px-3 py-2 font-mono text-caption whitespace-pre-wrap text-card"
        >
          {`---\nname: ${frontMatter.name}\ndescription: ${frontMatter.description}\n---`}
        </code>
      </InView>
    </>
  );
}

export function DescriptionTest(props: DescriptionTestProps) {
  const { title, should, shouldNot, nearMiss, quote, footnote, target, footnoteTarget } = props;
  return (
    <ZoneCard {...target} className="flex flex-col gap-3 rounded-xl p-4 shadow-md">
      <p className="flex items-center gap-1 text-body font-semibold">{title}</p>
      <Lead lead={props.lead} frontMatter={props.frontMatter} />
      <div className="grid gap-4 @xl:grid-cols-2">
        <Requests kind="should" label={should.label} requests={should.requests} nearMiss={nearMiss} quote={quote} />
        <Requests
          kind="should-not"
          label={shouldNot.label}
          requests={shouldNot.requests}
          nearMiss={nearMiss}
          quote={quote}
        />
      </div>
      <p {...footnoteTarget} className="flex items-start gap-1 text-caption text-muted-foreground">
        {footnote}
      </p>
    </ZoneCard>
  );
}
