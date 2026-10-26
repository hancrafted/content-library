/** Structured data as plain data: a schema.org document, built by page assembly (FE-008 §6). */
interface StructuredData {
  readonly '@context': string;
}

/** Renders structured data as a `<script type="application/ld+json">`. `<` is escaped so no string can close the tag. */
export function JsonLdScript({ data }: { data: StructuredData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
