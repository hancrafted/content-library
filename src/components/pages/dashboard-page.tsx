import { Dashboard } from '@/components/dashboard/dashboard.client';
import { TRANSLATIONS } from '@/i18n/translations';

export function DashboardPage() {
  const copy = TRANSLATIONS.en.dashboard;
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
      <header className="mb-8 space-y-3">
        <p className="text-caption font-mono text-muted-foreground">{copy.eyebrow}</p>
        <h1 className="text-subheading font-semibold">{copy.title}</h1>
        <p className="max-w-2xl text-body text-muted-foreground">{copy.intro}</p>
      </header>
      <Dashboard copy={copy} />
    </main>
  );
}
