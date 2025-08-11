import '@/app/globals.css';

import { AdminAppSidebar } from '@/components/Admin/Sidebar/app-sidebar';
import { SiteHeader } from '@/components/Layout/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { requireAdmin } from '@/utils/auth-guard';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <SidebarProvider>
      <AdminAppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="w-full p-5">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
