import '@/app/globals.css';

import { AdminAppSidebar } from '@/components/Admin/Sidebar/app-sidebar';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { SiteHeader } from '@/components/Layout/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { requireAdmin } from '@/utils/auth-guard';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    try {
        await requireAdmin();
    } catch (error) {
        redirect('/sign-in?redirect=/admin/dashboard');
    }
    return (
        <SidebarProvider>
            <AdminAppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <main className="w-full p-5 ">
                    <QueryErrorWrapper>
                        <Suspense>{children}</Suspense>
                    </QueryErrorWrapper>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
