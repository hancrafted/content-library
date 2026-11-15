import type { Section } from '@/episodes/components/slide-master/slide';
import { doesTheSkillMakeThingsBetter } from '../slides/does-the-skill-make-things-better/slide';
import { sharedSkillsAreKnowledgeArticles } from '../slides/shared-skills-are-knowledge-articles/slide';
import { sharingIt } from '../slides/sharing-it/slide';
import { whoOwnsTheSharedSkillLibrary } from '../slides/who-owns-the-shared-skill-library/slide';

/** Placement marker of the Section "Sharing it": its Slides in Spec order, section slide first. */
export const sharingItSection: Section = [
  sharingIt,
  sharedSkillsAreKnowledgeArticles,
  whoOwnsTheSharedSkillLibrary,
  doesTheSkillMakeThingsBetter,
];
