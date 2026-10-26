import { DashboardPage } from '@/page-assembly/dashboard/dashboard-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';

export const metadata = pageMetadata({ kind: 'dashboard' }, 'en');

export default function Page() {
  return <DashboardPage />;
}
