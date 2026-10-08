import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

/**
 * How the drawer works, shown on both tabs of the Title slide's item. A note,
 * not an alert: nothing is wrong and nothing interrupts, so `role="note"`
 * replaces the Alert's default `alert`. Print drops it with the rest of the chrome.
 */
export function DrawerExplainer({ text }: { text: string }) {
  return (
    <Alert role="note" className="print:hidden">
      <Info aria-hidden />
      <AlertDescription>{text}</AlertDescription>
    </Alert>
  );
}
