import type { JsonLd } from '@/lib/structured-data.pure';

/** Renders structured data as a `<script type="application/ld+json">`. `<` is escaped so no string can close the tag. */
export function JsonLdScript({ data }: { data: JsonLd }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
