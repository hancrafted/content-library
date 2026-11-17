import type { Section } from '@/episodes/components/slide-master/slide';
import { definingAndBuilding } from '../slides/defining-and-building/slide';
import { everyProductIsATranslation } from '../slides/every-product-is-a-translation/slide';
import { precisionAndAccuracy } from '../slides/precision-and-accuracy/slide';
import { valueWasAlwaysTranslation } from '../slides/value-was-always-translation/slide';

export const everyProductIsATranslationSection: Section = [
  everyProductIsATranslation,
  valueWasAlwaysTranslation,
  definingAndBuilding,
  precisionAndAccuracy,
];
