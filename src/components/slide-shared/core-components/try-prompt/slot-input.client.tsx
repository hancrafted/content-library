'use client';

import { Plus, Upload } from 'lucide-react';
import { useId, useState } from 'react';
import { IconButton } from '../icon-button/icon-button.client';
import {
  sampleOf,
  slotKeys,
  visibleKeys,
  type PromptSection,
  type PromptSlot,
  type SlotValues,
} from './prompt-sections.pure';
import type { TryPromptWords } from './try-prompt.types';

/* A paste-in slot: a textarea per entry taking a paste, an upload for a markdown file, and for a multiple slot a plus button. */

const FIELD =
  'w-full rounded-md border border-border bg-background p-2 text-caption outline-none focus-visible:ring-2 focus-visible:ring-ring';

interface EntryProps {
  readonly name: string;
  readonly label: string;
  readonly sample: string | undefined;
  readonly value: string;
  readonly uploadLabel: string;
  readonly onValue: (value: string) => void;
}

function UploadButton({ label, onValue }: { label: string; onValue: (value: string) => void }) {
  return (
    <label className="inline-flex min-h-9 w-fit cursor-pointer items-center gap-1.5 text-caption text-muted-foreground focus-within:ring-2 focus-within:ring-ring">
      <Upload aria-hidden="true" className="size-4" />
      {label}
      <input
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void file.text().then(onValue);
          event.target.value = '';
        }}
      />
    </label>
  );
}

function SlotEntry({ name, label, sample, value, uploadLabel, onValue }: EntryProps) {
  const id = useId();
  return (
    <div data-slot-entry={name} className="flex flex-col gap-1">
      <label htmlFor={id} className="text-caption font-medium">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        value={value}
        placeholder={sample}
        onChange={(event) => onValue(event.target.value)}
        className={FIELD}
      />
      <UploadButton label={uploadLabel} onValue={onValue} />
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
    <div data-slot={slot.id} className="flex flex-col gap-2">
      {keys.map((key, at) => (
        <SlotEntry
          key={key}
          name={key}
          sample={sampleOf(slot, key)}
          label={numbered ? `${slot.label} ${at + 1}` : slot.label}
          value={values[key] ?? ''}
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
