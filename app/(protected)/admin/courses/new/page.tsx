'use server';

import CourseForm from '@/components/Admin/Courses/course-form';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { requireAdmin } from '@/utils/auth-guard';
import { Suspense } from 'react';

export default async function NewCourse() {
    await requireAdmin();

    return (<QueryErrorWrapper>
        <Suspense>
            <CourseForm formTitle="Create New Course Form" />
        </Suspense>
    </QueryErrorWrapper>)
}
