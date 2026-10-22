import { Dashboard } from '@/components/dashboard/dashboard.client';
import { PAGE_CONTAINER, PageHeader } from '@/components/page-header';
import { TRANSLATIONS } from '@/i18n/translations';

export function DashboardPage() {
  const copy = TRANSLATIONS.en.dashboard;
  return (
    <main data-dashboard className={PAGE_CONTAINER}>
      <PageHeader title={copy.title} intro={<p>{copy.intro}</p>} />
      <Dashboard copy={copy} />
    </main>
  );
}
