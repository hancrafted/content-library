import { Dashboard } from '@/pipeline/components/dashboard.client';
import { PAGE_CONTAINER, PageHeader } from '@/shared/components/page-header';
import en from './i18n/en.json';

export function DashboardPage() {
  const copy = en.dashboard;
  return (
    <main data-dashboard className={PAGE_CONTAINER}>
      <PageHeader title={copy.title} intro={<p>{copy.intro}</p>} />
      <Dashboard copy={copy} />
    </main>
  );
}
