'use server';

import EnrollmentFormModal from '@/components/Admin/Enrollments/enrollment-form';
import { requireAdmin } from '@/utils/auth-guard';

export default async function NewEnrollement() {
  await requireAdmin();

  return (
    <div className="flex h-full items-center justify-center space-y-4">
      <EnrollmentFormModal formTitle="Create New Enrollment" />
    </div>
  );
}
