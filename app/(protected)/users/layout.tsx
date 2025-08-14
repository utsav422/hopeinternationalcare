import '@/app/globals.css';
import { Suspense } from 'react';
import { requireUser } from '@/utils/auth-guard';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireUser();

    return (<QueryErrorWrapper>
        <Suspense fallback="Loading...">{children}</Suspense>
    </QueryErrorWrapper>);
}
