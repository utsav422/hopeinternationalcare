import { Suspense } from 'react';
import { requireAdmin } from '@/utils/auth-guard';
import IntakesByCourseYear from '@/components/Admin/Intakes/intakes-by-course-year';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { Skeleton } from '@/components/ui/skeleton';

function IntakesSearchSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        </div>
    );
}

export default async function IntakesSearchPage() {
    await requireAdmin();
    
    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Search Intakes</h1>
                <p className="text-muted-foreground">
                    Search for intakes by course and year to view detailed information and statistics.
                </p>
            </div>
            
            <QueryErrorWrapper>
                <Suspense fallback={<IntakesSearchSkeleton />}>
                    <IntakesByCourseYear />
                </Suspense>
            </QueryErrorWrapper>
        </div>
    );
}
