import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { queryKeys } from '@/lib/query-keys';
import { adminUserList } from '@/lib/server-actions/admin/users';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import UsersTables from '@/components/Admin/Users/users-tables';
import {
    ZodUsersQuerySchema,
    ZodUsersQueryType,
} from '@/lib/db/drizzle-zod-schema';
import { normalizeProps } from '@/lib/normalizeProps';
import { redirect } from 'next/navigation';
import { IdParamsSchema } from '@/lib/types/shared';

export default async function UserPage({
    params: promisedParams,
    searchParams: promisedSearchParams,
}: {
    params: Promise<{}>;
    searchParams: Promise<ZodUsersQueryType>;
}) {
    // Await the promised params and searchParams
    const _params = await promisedParams;
    const searchParams = await promisedSearchParams;
    // Validate and normalize the props
    const { params: validatedParams, searchParams: validatedSearchParams } =
        await normalizeProps(
            IdParamsSchema,
            ZodUsersQuerySchema,
            _params,
            searchParams
        );

    try {
        await requireAdmin();
    } catch (error) {
        redirect('/admin-auth/sign-in?redirect=/admin/categories');
    }
    const {
        page,
        pageSize,
        // sortBy,
        // order,
        // filters,
    } = validatedSearchParams;

    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
        queryKey: queryKeys.users.list({ page, pageSize }),
        queryFn: async () =>
            await adminUserList(Number(page), Number(pageSize)),
    });

    return (
        <div className="space-y-6">
            {/* Breadcrumb Navigation */}
            {/*<UserManagementBreadcrumb />*/}

            {/* Quick Navigation */}
            {/*<UserManagementQuickNav />*/}

            <HydrationBoundary state={dehydrate(queryClient)}>
                <QueryErrorWrapper>
                    <Suspense fallback={<>Loading ...</>}>
                        <UsersTables />
                    </Suspense>
                </QueryErrorWrapper>
            </HydrationBoundary>
        </div>
    );
}
