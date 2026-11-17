import type { IsoDate } from '../../content-store/schemas/fields';

// decision: docs/decision-records/0016-content-data-model.md
export const BUILD_DAY: IsoDate = new Date().toISOString().slice(0, 10);
