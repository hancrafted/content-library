'use client';

import { cn } from '@/lib/utils';
import { Eye, EyeOff, Plus, Upload } from 'lucide-react';
import { useId, useState } from 'react';
import { IconButton, OUTLINED_ICON } from '../icon-button/icon-button.client';
import { Tip } from '../tip/tip.client';
import {
  sampleOf,
  sampleSummary,
  slotKeys,
  visibleKeys,
  type PromptSection,
  type PromptSlot,
  type SlotValues,
} from './prompt-sections.pure';
import type { TryPromptWords } from './try-prompt.types';

/*
 * A paste-in slot: per entry a visible label with an upload button and an eye toggle on its right, above a textarea.
 * The textarea is one row until the eye expands it; it stays a textarea so a paste keeps every line break. For a
 * multiple slot a plus button adds the next entry.
 */

const FIELD =
  'block w-full min-w-0 resize-none rounded-md border border-border bg-background px-2 py-1.5 text-caption outline-none focus-visible:ring-2 focus-visible:ring-ring';
const EXPANDED_ROWS = 8;

interface EntryProps {
  readonly name: string;
  readonly label: string;
  readonly sample: string | undefined;
  readonly value: string;
  readonly words: TryPromptWords;
  readonly uploadLabel: string;
  readonly onValue: (value: string) => void;
}

function UploadButton({ label, onValue }: { label: string; onValue: (value: string) => void }) {
  return (
    <Tip text={label} place="above" align="end">
      <label className={cn(OUTLINED_ICON, 'focus-within:ring-2 focus-within:ring-ring')}>
        <Upload aria-hidden="true" className="size-4" />
        <input
          type="file"
          aria-label={label}
          accept=".md,.markdown,text/markdown,text/plain"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void file.text().then(onValue);
            event.target.value = '';
          }}
        />
      </label>
    </Tip>
  );
}

/** The hint of an empty field: its sample's H1 and line count. */
function hintOf(sample: string | undefined, words: TryPromptWords): string | undefined {
  if (sample === undefined) return undefined;
  const { title, lines } = sampleSummary(sample);
  return words.sampleHint.replace('{title}', title).replace('{lines}', String(lines));
}

function SlotEntry({ name, label, sample, value, words, uploadLabel, onValue }: EntryProps) {
  const id = useId();
  const [full, setFull] = useState(false);
  const Icon = full ? EyeOff : Eye;
  const tip = full ? words.collapse : words.showFull;
  return (
    <div data-slot-entry={name} className="flex min-w-0 flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="min-w-0 text-caption font-medium">
          {label}
        </label>
        <div className="flex shrink-0 items-center gap-1.5">
          <UploadButton label={uploadLabel} onValue={onValue} />
          <IconButton label={tip} place="above" align="end" aria-pressed={full} onClick={() => setFull((now) => !now)}>
            <Icon aria-hidden="true" className="size-4" />
          </IconButton>
        </div>
      </div>
      <textarea
        id={id}
        rows={full ? EXPANDED_ROWS : 1}
        wrap={full ? 'soft' : 'off'}
        value={value}
        placeholder={hintOf(sample, words)}
        onChange={(event) => onValue(event.target.value)}
        className={cn(FIELD, !full && 'overflow-hidden whitespace-pre')}
      />
    </div>
  );
}

interface SlotInputProps {
  readonly slot: PromptSlot;
  readonly sections: readonly PromptSection[];
  readonly values: SlotValues;
  readonly words: TryPromptWords;
  readonly onValue: (key: string, value: string) => void;
}

export function SlotInput({ slot, sections, values, words, onValue }: SlotInputProps) {
  const [added, setAdded] = useState(1);
  const all = slotKeys(slot, sections);
  const keys = slot.mode === 'single' ? all : visibleKeys(all, values, added);
  const numbered = slot.mode === 'multiple';
  return (
    <div data-slot={slot.id} className="flex min-w-0 flex-col gap-2">
      {keys.map((key, at) => (
        <SlotEntry
          key={key}
          name={key}
          sample={sampleOf(slot, key)}
          label={numbered ? `${slot.label} ${at + 1}` : slot.label}
          value={values[key] ?? ''}
          words={words}
          uploadLabel={words.upload ?? slot.label}
          onValue={(value) => onValue(key, value)}
        />
      ))}
      {numbered && keys.length < all.length && (
        <span data-slot-add="">
          <IconButton label={words.addEntry ?? slot.label} onClick={() => setAdded(keys.length + 1)}>
            <Plus aria-hidden="true" className="size-4" />
          </IconButton>
        </span>
      )}
    </div>
  );
}
