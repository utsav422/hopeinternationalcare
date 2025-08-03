import { Suspense } from 'react';
import CategoryForm from '@/components/Admin/categories/category-form';
import { requireAdmin } from '@/utils/auth-guard';

export default async function NewCategoryPage() {
  await requireAdmin();
  return (
    <Suspense fallback="Loading...">
      <CategoryForm formTitle="Create new Category" />
    </Suspense>
  );
}
