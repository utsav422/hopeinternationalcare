import {Suspense} from 'react';
import {dehydrate, HydrationBoundary, QueryClient} from '@tanstack/react-query';
import {requireAdmin} from '@/utils/auth-guard';
import {getDeletedUsersAction} from '@/lib/server-actions/admin/user-deletion';
import DeletedUsersPage from '@/components/Admin/Users/deleted-users-page';
import {Skeleton} from '@/components/ui/skeleton';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
import {ZodAdminCourseCategoryQuerySchema, ZodDeletedUsersQueryType} from '@/lib/db/drizzle-zod-schema';
import {queryKeys} from "@/lib/query-keys";
import {normalizeProps} from "@/lib/normalizeProps";
import {notFound, redirect} from "next/navigation";
import {IdParams, IdParamsSchema} from "@/lib/types/shared";



// Loading component for the deleted users page
function DeletedUsersPageSkeleton() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48"/>
                    <Skeleton className="h-4 w-96"/>
                </div>
                <Skeleton className="h-10 w-32"/>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({length: 4}).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24"/>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16"/>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32"/>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Skeleton className="h-10 w-full"/>
                        <Skeleton className="h-10 w-full"/>
                        <Skeleton className="h-10 w-full"/>
                        <Skeleton className="h-10 w-full"/>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-32"/>
                        <Skeleton className="h-10 w-40"/>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({length: 5}).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-full"/>
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-48"/>
                                    <Skeleton className="h-3 w-32"/>
                                </div>
                                <Skeleton className="h-8 w-24"/>
                                <Skeleton className="h-8 w-8"/>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default async function DeletedUsersPageRoute({params: promisedParams, searchParams: promisedSearchParams}: {
    params: Promise<IdParams>, searchParams: Promise<ZodDeletedUsersQueryType>;
}) {
    // Await the promised params and searchParams
    const _params = await promisedParams;
    const searchParams = await promisedSearchParams;
    // Validate and normalize the props
    const {
        params: validatedParams,
        searchParams: validatedSearchParams
    } = await normalizeProps(IdParamsSchema, ZodAdminCourseCategoryQuerySchema, _params, searchParams);
    if (!validatedParams.id) {
        notFound();
    }
    // Require admin authentication

    // Create a query client for prefetching
    const queryClient = new QueryClient();
    try {
        await requireAdmin();
    } catch (error) {
        redirect('/admin-auth/sign-in?redirect=/admin/categories')
    }


    const searchParamsObj = new URLSearchParams();

    // Add all parameters to search params
    Object.entries(validatedSearchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value.toString() !== '') {
            searchParamsObj.append(key, value.toString());
        }
    });

    try {
        // Prefetch deleted users' data
        await queryClient.prefetchQuery({
            queryKey: queryKeys.users.all,
            queryFn: async () => {

                const result = await getDeletedUsersAction(searchParamsObj);
                if (!result.success) {
                    throw new Error(result.message || 'Failed to fetch deleted users');
                }

                return result.data;
            },
            staleTime: 30 * 1000, // 30 seconds
        });

        // Prefetch deletion statistics
        // await queryClient.prefetchQuery({
        //     queryKey: [[...userDeletionKeys.all].flat(), 'statistics'],
        //     queryFn: async () => {
        //         // Get basic statistics from deleted users
        //         a const result = await getDeletedUsersAction(searchParamsObj);
        //
        //         if (!result.success) {
        //             throw new Error(result.message || 'Failed to fetch statistics');
        //         }
        //
        //         return {
        //             totalDeleted: result.data?.pagination?.total,
        //         };
        //     },
        //     staleTime: 2 * 60 * 1000, // 2 minutes
        // });
    } catch (error) {
        console.error('Failed to prefetch deleted users data:', error);
        // Continue rendering with empty data - the client will handle the error
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<DeletedUsersPageSkeleton/>}>
                <DeletedUsersPage/>
            </Suspense>
        </HydrationBoundary>
    );
}
