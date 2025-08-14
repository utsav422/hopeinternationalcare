'use server';

import { Suspense } from 'react';
import EnrollmentFormModal from '@/components/Admin/Enrollments/enrollment-form';
import { requireAdmin } from '@/utils/auth-guard';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';

export default async function NewEnrollement() {
    await requireAdmin();

    return (<QueryErrorWrapper>
        <Suspense fallback="Loading...">
            <EnrollmentFormModal formTitle="Create New Enrollment" />
        </Suspense>
    </QueryErrorWrapper>
    );
}
