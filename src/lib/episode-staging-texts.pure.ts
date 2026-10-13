import { type Finding } from './finding.pure';
import { checkResearchSources } from './research-sources.pure';
import { checkTitleMatchesH1 } from './title-h1.pure';

const TITLED_FILE = /(^|\/)(brief|dossier|research|feedback)\.md$/;
const RESEARCH_FILE = /^research\/[^/]+\/research\.md$/;

/** The per-file checks on frontmatter: a title equal to its h1, and a research file's sources against its footnotes. */
export function checkTexts(files: Readonly<Record<string, string>>): Finding[] {
  return Object.entries(files).flatMap(([file, markdown]) => [
    ...(TITLED_FILE.test(file) ? checkTitleMatchesH1(file, markdown) : []),
    ...(RESEARCH_FILE.test(file) ? checkResearchSources(file, markdown) : []),
  ]);
}
