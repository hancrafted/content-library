import type { Section } from '@/episodes/components/slide-master/slide';
import { about } from '../slides/about/slide';

/**
 * The Section `about`, the Brief's "Why, how and what" (placement marker, owned by the
 * `implement-section-why-how-and-what` job): its section slide, then Why, How and What on one Slide, which that job
 * adds after it. With that page Slide in place the job wraps the list in `withoutSectionSlide`, as the Spec's Episode
 * page asks: a Section of its section slide alone cannot declare none, since there is no page Slide to stand in for it.
 */
export const aboutSection: Section = [about];
