import { Dashboard } from '@/components/dashboard/dashboard.client';
import { TRANSLATIONS } from '@/i18n/translations';

export function DashboardPage() {
  const copy = TRANSLATIONS.en.dashboard;
  return (
    <main data-dashboard className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-8">
      <Dashboard copy={copy} />
    </main>
  );
}
