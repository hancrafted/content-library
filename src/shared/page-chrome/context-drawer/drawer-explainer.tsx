import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Info } from 'lucide-react';

export function DrawerExplainer({ text }: { text: string }) {
  return (
    <Alert role="note" className="print:hidden">
      <Info aria-hidden />
      <AlertDescription>{text}</AlertDescription>
    </Alert>
  );
}
