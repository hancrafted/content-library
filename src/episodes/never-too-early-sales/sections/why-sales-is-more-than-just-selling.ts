import type { Section } from '@/episodes/components/slide-master/slide';
import { salesIsMoreThanSelling } from '../slides/sales-is-more-than-selling/slide';
import { whySalesIsMoreThanJustSelling } from '../slides/why-sales-is-more-than-just-selling/slide';

/** Placement marker of the Section "Why sales is more than just selling": its Slides in Spec order, section slide first. */
export const whySalesIsMoreThanJustSellingSection: Section = [whySalesIsMoreThanJustSelling, salesIsMoreThanSelling];
