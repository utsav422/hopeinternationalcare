import '@/app/globals.css';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { SiteHeader } from '@/components/Layout/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { UserAppSidebar } from '@/components/User/Sidebar/app-sidebar';
import { requireUser } from '@/utils/auth-guard';
import { Suspense } from 'react';
import { logger } from '@/utils/logger';
import { redirect } from 'next/navigation';

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    try {
        await requireUser();
    } catch (error) {
        logger.error(error instanceof Error ? error?.message : 'Unknown error');
        redirect('/sign-in?redirect=/users/profile');
    }
    return (
        <SidebarProvider>
            <UserAppSidebar variant="inset" />
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
