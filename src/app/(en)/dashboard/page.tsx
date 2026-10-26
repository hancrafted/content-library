import { DashboardPage } from '@/components/pages/dashboard-page';
import { pageMetadata } from '@/lib/page-metadata.pure';

export const metadata = pageMetadata({ kind: 'dashboard' }, 'en');

export default function Page() {
  return <DashboardPage />;
}
