import { type Finding } from './finding.pure';
import { checkResearchSources } from './research-sources.pure';
import { checkTitleMatchesH1 } from './title-h1.pure';

const TITLED_FILE = /(^|\/)(brief|dossier|research|feedback)\.md$/;
const RESEARCH_FILE = /^research\/[^/]+\/research\.md$/;

export function checkTexts(files: Readonly<Record<string, string>>): Finding[] {
  return Object.entries(files).flatMap(([file, markdown]) => [
    ...(TITLED_FILE.test(file) ? checkTitleMatchesH1(file, markdown) : []),
    ...(RESEARCH_FILE.test(file) ? checkResearchSources(file, markdown) : []),
  ]);
}
