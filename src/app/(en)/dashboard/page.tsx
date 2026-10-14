import { DashboardPage } from '@/components/pages/dashboard-page';
import { pageMetadata } from '@/lib/page-metadata.pure';

export const metadata = pageMetadata('dashboard', 'en');

export default function Page() {
  return <DashboardPage />;
}
