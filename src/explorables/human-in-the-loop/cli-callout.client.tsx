'use client';

import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import { ROUTES } from '@/shared/lib/static-routes';
import { templateSegments } from '@/shared/lib/template.pure';
import { Terminal } from 'lucide-react';
import type { UiWords } from './human-in-the-loop.types';

const SETUP_GUIDE = `${ROUTES.guides}/setup-ai-agent-and-starter-folder`;

const GUIDE_ANCHORS = {
  skills: 'the-technical-route--set-up-the-matt-pocock-skills-yourself',
  download: 'your-folder--download-and-unzip-the-starter-folder',
} as const;

const LINK_WORDS = { skills: 'cliCalloutSkills', download: 'cliCalloutDownload' } as const;

type CliCalloutWords = Pick<UiWords, 'cliCallout' | 'cliCalloutSkills' | 'cliCalloutDownload'>;

export function CliCallout({ words, locale }: { readonly words: CliCalloutWords; readonly locale: Locale }) {
  const segments = templateSegments(words.cliCallout, ['skills', 'download'] as const);
  return (
    <Alert role="note" data-cli-callout="" className="mb-4">
      <Terminal aria-hidden="true" />
      <AlertDescription className="block">
        {segments.map((segment, index) =>
          'slot' in segment ? (
            <a
              key={segment.slot}
              href={localizePath(SETUP_GUIDE, locale, GUIDE_ANCHORS[segment.slot])}
              className="font-medium text-foreground underline underline-offset-4"
            >
              {words[LINK_WORDS[segment.slot]]}
            </a>
          ) : (
            <span key={index}>{segment.text}</span>
          ),
        )}
      </AlertDescription>
    </Alert>
  );
}
