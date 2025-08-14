import { Suspense } from 'react';
import CategoryForm from '@/components/Admin/categories/category-form';
import { requireAdmin } from '@/utils/auth-guard';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';

export default async function NewCategoryPage() {
    await requireAdmin();
    return (<QueryErrorWrapper>
        <Suspense fallback="Loading...">
            <CategoryForm formTitle="Create new Category" />
        </Suspense>
    </QueryErrorWrapper>
    );
}
