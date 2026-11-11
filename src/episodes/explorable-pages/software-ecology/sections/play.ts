import type { Section } from '@/episodes/components/slide-master/slide';
import { play } from '../slides/play/slide';

/**
 * The Section `play` (placement marker, owned by the `implement-section-play` job): its section slide, then the
 * Explorable with every option on, which that job adds after it. With that page Slide in place the job wraps the list
 * in `withoutSectionSlide`, as the Spec's Episode page asks: a Section of its section slide alone cannot declare
 * none, since there is no page Slide to stand in for it.
 */
export const playSection: Section = [play];
