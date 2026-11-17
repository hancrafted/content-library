// decision: FE-008 §6
interface StructuredData {
  readonly '@context': string;
}

export function JsonLdScript({ data }: { data: StructuredData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
