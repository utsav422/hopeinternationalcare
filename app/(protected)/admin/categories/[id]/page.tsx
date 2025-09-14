import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {cachedAdminCourseCategoryDetailsById} from '@/lib/server-actions/admin/course-categories';
import {requireAdmin} from '@/utils/auth-guard';
import {getQueryClient} from '@/utils/get-query-client';
import {notFound, redirect} from 'next/navigation';
import {ZodAdminCourseCategoryQuerySchema, ZodAdminCourseCategoryQueryType} from "@/lib/db/drizzle-zod-schema";
import {normalizeProps} from "@/lib/normalizeProps";
import {IdParams, IdParamsSchema} from "@/lib/types/shared";


export default async function CategoryDetailsPage({params: promisedParams, searchParams: promisedSearchParams}: {
    params: Promise<IdParams>,
    searchParams: Promise<ZodAdminCourseCategoryQueryType>
}) {
    // Await the promised params and searchParams
    const params = await promisedParams;
    const searchParams = await promisedSearchParams;

    // Validate and normalize the props
    const {
        params: validatedParams,
        searchParams: validatedSearchParams
    } = await normalizeProps(IdParamsSchema, ZodAdminCourseCategoryQuerySchema, params, searchParams);

    if (!validatedParams.id) {
        notFound();
    }
    try {
        await requireAdmin();
    } catch (error) {
        redirect('/admin-auth/sign-in?redirect=/admin/categories')
    }

    const queryClient = getQueryClient();
    const result = await cachedAdminCourseCategoryDetailsById(validatedParams?.id);
    const data = result.success ? result.data : null;

    if (!data) {
        notFound();
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Card>
                <CardHeader>
                    <CardTitle>Category Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        <strong>Name:</strong> {data.name}
                    </p>
                    <p>
                        <strong>Description:</strong> {data.description}
                    </p>
                    <p>
                        <strong>created at:</strong> {data.created_at}
                    </p>
                </CardContent>
            </Card>
        </HydrationBoundary>
    );
}

