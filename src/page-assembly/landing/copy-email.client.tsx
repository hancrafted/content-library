'use client';

import { Button } from '@/shared/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

const COPIED_FOR_MILLISECONDS = 2000;

// decision: FE-001 §1
function useCopied(text: string) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_FOR_MILLISECONDS);
    return () => clearTimeout(timer);
  }, [copied]);
  const copy = () => {
    void navigator.clipboard?.writeText(text).then(() => setCopied(true));
  };
  return { copied, copy };
}

function CopyButton({ copied, copy, label }: { copied: boolean; copy: () => void; label: string }) {
  const Icon = copied ? Check : Copy;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-11 cursor-pointer"
      onClick={copy}
      aria-label={label}
      title={label}
      data-testid="contact-email-copy"
    >
      <Icon aria-hidden />
    </Button>
  );
}

// decision: FE-003 §2
export function CopyEmail({
  email,
  labels,
}: {
  email: string;
  labels: { lead: string; copy: string; copied: string };
}) {
  const { copied, copy } = useCopied(email);
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body">
      <span className="text-muted-foreground">{labels.lead}</span>
      <span data-testid="contact-email" className="font-mono font-semibold text-foreground select-all">
        {email}
      </span>
      <CopyButton copied={copied} copy={copy} label={labels.copy} />
      <span role="status" className="text-caption text-muted-foreground">
        {copied ? labels.copied : ''}
      </span>
    </p>
  );
}
