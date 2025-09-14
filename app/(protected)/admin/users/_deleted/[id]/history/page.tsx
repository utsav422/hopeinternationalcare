import {Suspense} from 'react';
import {dehydrate, HydrationBoundary, QueryClient,} from '@tanstack/react-query';
import {requireAdmin} from '@/utils/auth-guard';
import {getUserDeletionHistoryAction} from '@/lib/server-actions/admin/user-deletion';
import {userDeletionKeys} from '@/hooks/admin/user-deletion';
import UserDeletionHistory from '@/components/Admin/Users/user-deletion-history';
import {Skeleton} from '@/components/ui/skeleton';
import {Card, CardContent, CardHeader} from '@/components/ui/card';


// Loading component for the deleted user history page
function DeletedUserHistoryPageSkeleton() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-64"/>
                <Skeleton className="h-4 w-80"/>
            </div>

            {/* User Info Card */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32"/>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-16 w-16 rounded-full"/>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-48"/>
                            <Skeleton className="h-4 w-64"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24"/>
                            <Skeleton className="h-5 w-40"/>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24"/>
                            <Skeleton className="h-5 w-40"/>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* History Table */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48"/>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({length: 3}).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-start space-x-4 p-4 border rounded-lg"
                            >
                                <Skeleton className="h-10 w-10 rounded-full mt-1"/>
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-5 w-32"/>
                                        <Skeleton className="h-4 w-24"/>
                                    </div>
                                    <Skeleton className="h-4 w-full"/>
                                    <Skeleton className="h-4 w-3/4"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default async function DeletedUserHistoryPageRoute(props: {
    params: Promise<{ id: string }>;
}) {
    // Require admin authentication
    await requireAdmin();

    // Extract user ID from params
    const {id} = await props.params;

    // Create query client for prefetching
    const queryClient = new QueryClient();

    try {
        // Prefetch deleted user history
        await queryClient.prefetchQuery({
            queryKey: userDeletionKeys.userHistory(id),
            queryFn: async () => {
                const result = await getUserDeletionHistoryAction(id);

                if (!result.success) {
                    throw new Error(result.message || 'Failed to fetch user history');
                }

                return result.data;
            },
            staleTime: 30 * 1000, // 30 seconds
        });
    } catch (error) {
        console.error(`Failed to prefetch history for user ${id}:`, error);
        // Continue rendering, client will handle the error state
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<DeletedUserHistoryPageSkeleton/>}>
                <UserDeletionHistory userId={id}/>
            </Suspense>
        </HydrationBoundary>
    );
}