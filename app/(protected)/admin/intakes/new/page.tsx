import { requireAdmin } from '@/utils/auth-guard';
import IntakeForm from '../../../../../components/Admin/Intakes/intake-form';
import FormSkeleton from '@/components/Custom/form-skeleton';
import { Suspense } from 'react';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';

export default async function NewIntakePage() {
    await requireAdmin();
    return (<QueryErrorWrapper>
        <Suspense fallback={<FormSkeleton />}>
            <IntakeForm formTitle="Create new Intake Form" />
        </Suspense>
    </QueryErrorWrapper>
    );
}
