'use server';

import { Suspense } from 'react';
import EnrollmentFormModal from '@/components/Admin/Enrollments/enrollment-form';
import { requireAdmin } from '@/utils/auth-guard';

export default async function NewEnrollement() {
  await requireAdmin();

  return (
    <Suspense fallback="Loading...">
      <EnrollmentFormModal formTitle="Create New Enrollment" />
    </Suspense>
  );
}
