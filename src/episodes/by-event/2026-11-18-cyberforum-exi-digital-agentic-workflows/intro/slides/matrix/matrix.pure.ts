import { parse } from 'yaml';
import { z } from 'zod';

// decision: FE-006 §1
const RowSchema = z.object({
  key: z.string(),
  enablement: z.boolean(),
  engineering: z.boolean(),
  today: z.boolean().default(false),
});

const MatrixSchema = z.object({
  groups: z.array(z.object({ key: z.string(), rows: z.array(RowSchema) })),
});

export type Matrix = z.infer<typeof MatrixSchema>;

export function parseMatrix(text: string): Matrix {
  return MatrixSchema.parse(parse(text));
}

interface LabelMessages {
  readonly groups: Readonly<Record<string, string>>;
  readonly rows: Readonly<Record<string, string>>;
}

export function missingLabels(matrix: Matrix, messages: LabelMessages): string[] {
  return matrix.groups.flatMap(({ key, rows }) => [
    ...(key in messages.groups ? [] : [`groups.${key}`]),
    ...rows.filter((row) => !(row.key in messages.rows)).map((row) => `rows.${row.key}`),
  ]);
}
